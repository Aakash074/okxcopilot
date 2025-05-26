import axios from 'axios';
import CryptoJS from 'crypto-js';

const OKX_BASE_URL = 'https://web3.okx.com';

/**
 * Generate authentication headers for OKX API requests
 * @param {string} timestamp - ISO timestamp
 * @param {string} method - HTTP method (GET, POST)
 * @param {string} requestPath - API endpoint path
 * @param {string} queryString - Query string for GET requests or body for POST requests
 * @returns {Object} - Headers object with authentication
 */
function getAuthHeaders(timestamp, method, requestPath, queryString = '') {
  // Get credentials from environment variables
  const apiKey = import.meta.env.VITE_OKX_API_KEY;
  const secretKey = import.meta.env.VITE_OKX_SECRET_KEY;
  const apiPassphrase = import.meta.env.VITE_OKX_API_PASSPHRASE;
  const projectId = import.meta.env.VITE_OKX_PROJECT_ID;

  console.log('Environment check:', {
    apiKey: apiKey ? `${apiKey.slice(0, 8)}...` : 'MISSING',
    secretKey: secretKey ? `${secretKey.slice(0, 8)}...` : 'MISSING',
    apiPassphrase: apiPassphrase ? `${apiPassphrase.slice(0, 4)}...` : 'MISSING',
    projectId: projectId ? `${projectId.slice(0, 8)}...` : 'MISSING'
  });

  if (!apiKey || !secretKey || !apiPassphrase || !projectId) {
    throw new Error('Missing OKX API credentials in environment variables');
  }

  // Create signature string: timestamp + method + requestPath + queryString
  const stringToSign = timestamp + method + requestPath + queryString;
  
  // Generate HMAC SHA256 signature and encode with Base64
  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(stringToSign, secretKey)
  );

  return {
    'Content-Type': 'application/json',
    'OK-ACCESS-KEY': apiKey,
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': apiPassphrase,
    'OK-ACCESS-PROJECT': projectId,
  };
}

/**
 * Fetch token price using OKX DEX API (quote endpoint)
 * Testing confirmed all Solana token pairs work - only requires authentication
 * @param {Object} params - { chainId, fromTokenAddress, toTokenAddress, amount }
 * @returns {Promise<Object>} - Quote data including token prices
 * @example
 *   const quote = await getTokenPrice({ 
 *     chainId: '501', 
 *     fromTokenAddress: '11111111111111111111111111111111', // SOL
 *     toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC (tested working)
 *     amount: '100000000' // 0.1 SOL (confirmed working amount)
 *   });
 */
export async function getTokenPrice({ chainId, fromTokenAddress, toTokenAddress, amount }) {
  const timestamp = new Date().toISOString();
  const requestPath = '/api/v5/dex/aggregator/quote';
  const params = new URLSearchParams({
    chainIndex: chainId, // Use chainIndex instead of chainId for newer API
    chainId,
    fromTokenAddress,
    toTokenAddress,
    amount
  });
  const queryString = '?' + params.toString();
  
  const headers = getAuthHeaders(timestamp, 'GET', requestPath, queryString);
  
  try {
    const { data } = await axios.get(`${OKX_BASE_URL}${requestPath}${queryString}`, { 
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    if (data.code !== '0') {
      throw new Error(`OKX API Error: ${data.msg} (Code: ${data.code})`);
    }
    
    // For quote endpoint, return the quote data with compatible format
    const quoteData = data.data[0];
    return {
      fromTokenAmount: quoteData.fromTokenAmount,
      toTokenAmount: quoteData.toTokenAmount,
      toTokenDecimals: quoteData.toToken.decimal
    };
  } catch (error) {
    console.error('Error fetching token price:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Handle specific rate limiting error
      if (error.response.status === 429 || 
          (error.response.data && error.response.data.code === '50011')) {
        throw new Error('Rate limit exceeded. Please try again in a few seconds.');
      }
    }
    throw error;
  }
}

/**
 * Simulate a token swap using OKX DEX API
 * @param {Object} params - { chainId, fromTokenAddress, toTokenAddress, amount, slippage, userWalletAddress }
 * @returns {Promise<Object>} - Swap simulation data
 * @example
 *   const swap = await simulateSwap({ 
 *     chainId: '1', 
 *     fromTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 
 *     toTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 
 *     amount: '1000000000000000000', 
 *     slippage: '0.5',
 *     userWalletAddress: '0x...' 
 *   });
 */
export async function simulateSwap({ chainId, fromTokenAddress, toTokenAddress, amount, slippage = '0.5', userWalletAddress }) {
  const timestamp = new Date().toISOString();
  const requestPath = '/api/v5/dex/aggregator/swap';
  const params = new URLSearchParams({
    chainId,
    fromTokenAddress,
    toTokenAddress,
    amount,
    slippage,
    userWalletAddress
  });
  const queryString = '?' + params.toString();
  
  const headers = getAuthHeaders(timestamp, 'GET', requestPath, queryString);
  
  try {
    const { data } = await axios.get(`${OKX_BASE_URL}${requestPath}${queryString}`, { headers });
    
    if (data.code !== '0') {
      throw new Error(`OKX API Error: ${data.msg}`);
    }
    
    return data.data[0];
  } catch (error) {
    console.error('Error simulating swap:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Get strategy suggestion from Perplexity API
 * @param {string} prompt - User's strategy prompt
 * @param {Object} portfolio - User's portfolio data
 * @returns {Promise<string>} - Action plan (e.g., swap 50% USDT to ETH)
 * @example
 *   const plan = await getStrategySuggestion('How to optimize my portfolio?', { USDT: 1000, ETH: 0.5 });
 *   // Requires VITE_PPLX_API_KEY in .env
 */
export async function getStrategySuggestion(prompt, portfolio) {
  // For Vite projects, use import.meta.env.VITE_PPLX_API_KEY
  const apiKey = import.meta.env.VITE_PPLX_API_KEY;
  if (!apiKey) throw new Error('Perplexity API key missing');
  
  // Determine if this is a strategy/trade request that should return JSON
  const isStrategyRequest = prompt.toLowerCase().includes('strategy') || 
                           prompt.toLowerCase().includes('trade') || 
                           prompt.toLowerCase().includes('swap') ||
                           prompt.toLowerCase().includes('opportunities');
  
  const url = 'https://api.perplexity.ai/chat/completions';
  
  const systemContent = isStrategyRequest 
    ? `You are a DeFi portfolio advisor. For trading strategy requests, respond ONLY with a valid JSON object in this exact format:
{
  "strategies": [
    {
      "title": "Strategy title",
      "description": "Why this strategy makes sense",
      "fromToken": "TOKEN_SYMBOL",
      "toToken": "TOKEN_SYMBOL", 
      "amount": "percentage or amount",
      "estimatedToAmount": "estimated amount",
      "actionId": "unique-id"
    }
  ]
}
Provide 1-3 realistic trading strategies based on current market conditions. Use token symbols from the user's portfolio.`
    : `You are a DeFi portfolio advisor. For analysis and price prediction requests, provide detailed text responses with specific insights about market conditions, price analysis, and recommendations.`;

  const body = {
    model: 'pplx-70b-online',
    messages: [
      {
        role: 'system',
        content: systemContent
      },
      {
        role: 'user',
        content: `Portfolio: ${JSON.stringify(portfolio)}. Question: ${prompt}`
      }
    ],
    max_tokens: isStrategyRequest ? 300 : 200
  };
  
  try {
    const { data } = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const response = data.choices[0].message.content;
    
    // For strategy requests, try to parse as JSON, fallback to text if invalid
    if (isStrategyRequest) {
      try {
        const parsed = JSON.parse(response);
        if (parsed.strategies && Array.isArray(parsed.strategies)) {
          return { type: 'json', data: parsed };
        }
      } catch {
        // If JSON parsing fails, return as text
        console.warn('Failed to parse strategy response as JSON, returning as text');
      }
    }
    
    return { type: 'text', data: response };
  } catch (error) {
    console.error('Error getting strategy suggestion:', error);
    throw error;
  }
}

/**
 * Perform a swap using OKX DEX API (prepares the transaction, does not broadcast)
 * @param {string} tokenIn - Contract address of the token to sell
 * @param {string} tokenOut - Contract address of the token to buy
 * @param {string} amount - Amount in minimal units (e.g., wei, lamports)
 * @param {Object} options - { chainId, slippage, userWalletAddress }
 * @returns {Promise<Object>} - Swap simulation data and transaction payload
 * @example
 *   const result = await performSwap('0x...', '0x...', '1000000', { chainId: '1', slippage: '0.5', userWalletAddress: '0x...' });
 */
export async function performSwap(tokenIn, tokenOut, amount, { chainId, slippage = '0.5', userWalletAddress }) {
  const timestamp = new Date().toISOString();
  const requestPath = '/api/v5/dex/aggregator/swap';
  const params = new URLSearchParams({
    chainId,
    fromTokenAddress: tokenIn,
    toTokenAddress: tokenOut,
    amount,
    slippage,
    userWalletAddress
  });
  const queryString = '?' + params.toString();
  
  const headers = getAuthHeaders(timestamp, 'GET', requestPath, queryString);
  
  try {
    const { data } = await axios.get(`${OKX_BASE_URL}${requestPath}${queryString}`, { headers });
    
    if (data.code !== '0') {
      throw new Error(`OKX API Error: ${data.msg}`);
    }
    
    return {
      swapData: data.data[0],
      transactionPayload: data.data[0].tx,
      estimatedOutput: data.data[0].routerResult?.toTokenAmount,
      priceImpact: data.data[0].priceImpactPercentage
    };
  } catch (error) {
    console.error('Error performing swap:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Estimate gas cost for a swap and provide a suggestion
 * @param {string} tokenIn - Contract address of the token to sell
 * @param {string} tokenOut - Contract address of the token to buy
 * @param {string} amount - Amount in minimal units
 * @param {Object} options - { chainId, slippage, userWalletAddress }
 * @returns {Promise<{ gas: string, suggestion: string, feeUSD?: string }>} - Gas estimate and suggestion
 * @example
 *   const { gas, suggestion, feeUSD } = await estimateSwapGas('0x...', '0x...', '1000000', { chainId: '1', slippage: '0.5', userWalletAddress: '0x...' });
 */
export async function estimateSwapGas(tokenIn, tokenOut, amount, { chainId, slippage = '0.5', userWalletAddress }) {
  try {
    const swapData = await performSwap(tokenIn, tokenOut, amount, { chainId, slippage, userWalletAddress });
    
    // Extract gas estimate from swap data
    const gasEstimate = swapData.swapData.tx?.gas || swapData.swapData.gasLimit || 'N/A';
    const gasPrice = swapData.swapData.tx?.gasPrice || swapData.swapData.gasPrice;
    
    let feeUSD;
    if (gasEstimate !== 'N/A' && gasPrice) {
      // Rough estimation: gas * gasPrice * ETH price (assuming ETH chain)
      const gasCost = (parseInt(gasEstimate) * parseInt(gasPrice)) / 1e18;
      feeUSD = (gasCost * 2500).toFixed(2); // Approximate ETH price
    }
    
    // Generate suggestion based on gas cost
    let suggestion = 'Gas fees are reasonable for this swap.';
    if (feeUSD && parseFloat(feeUSD) > 50) {
      suggestion = 'High gas fees detected. Consider swapping during off-peak hours or using Layer 2 solutions.';
    } else if (feeUSD && parseFloat(feeUSD) > 20) {
      suggestion = 'Moderate gas fees. You might want to wait for lower network congestion.';
    } else {
      suggestion = 'Good time to swap! Gas fees are relatively low.';
    }
    
    return {
      gas: gasEstimate.toString(),
      suggestion,
      feeUSD
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Usage Example (in your component or service):
// import { getTokenPrice, simulateSwap } from './okxDexApi';
// const price = await getTokenPrice({ chainId, fromTokenAddress, toTokenAddress, amount });
// const swap = await simulateSwap({ chainId, fromTokenAddress, toTokenAddress, amount, userWalletAddress });
// const plan = await getStrategySuggestion('How to optimize my portfolio?', { USDT: 1000, ETH: 0.5 });
// console.log(plan); 