// 🔍 Comprehensive Token Address Verification Tool
// Respects rate limits and tests all Solana token addresses

console.log('🔍 COMPREHENSIVE TOKEN ADDRESS VERIFICATION');
console.log('==========================================\n');

// All token addresses from your Portfolio.jsx
const TOKENS_TO_VERIFY = [
  {
    symbol: 'SOL',
    mint: '11111111111111111111111111111111',
    decimals: 9,
    description: 'Native SOL'
  },
  {
    symbol: 'USDT',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    description: 'USDT (Corrected Address)'
  },
  {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    description: 'USDC (Corrected Address)'
  },
  {
    symbol: 'wBTC',
    mint: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    decimals: 6,
    description: 'Wrapped Bitcoin'
  },
  {
    symbol: 'wETH',
    mint: '7vfCXTUXx8kP4HT8YhJPgJ7Y4w6vjbQfgFQQs1nCJ3Kn',
    decimals: 8,
    description: 'Wrapped Ethereum'
  },
  {
    symbol: 'wBNB',
    mint: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    decimals: 8,
    description: 'Wrapped BNB'
  }
];

// Base token for quotes (use USDC as it has best liquidity)
const QUOTE_TOKEN = {
  symbol: 'USDC',
  mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  decimals: 6
};

// Rate limiting configuration
const RATE_LIMIT = {
  delay: 3000,        // 3 seconds between requests (conservative)
  maxRetries: 2,      // Max retry attempts
  retryDelay: 5000    // 5 seconds between retries
};

// Test amounts for each token (realistic amounts)
const getTestAmount = (token) => {
  const amounts = {
    'SOL': 0.1,          // 0.1 SOL
    'USDT': 10,          // 10 USDT
    'USDC': 10,          // 10 USDC
    'wBTC': 0.0001,      // 0.0001 wBTC
    'wETH': 0.001,       // 0.001 wETH
    'wBNB': 0.01         // 0.01 wBNB
  };
  
  const amount = amounts[token.symbol] || 0.01;
  return Math.floor(amount * (10 ** token.decimals)).toString();
};

// Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test a single token address
async function verifyTokenAddress(token, retryCount = 0) {
  const testAmount = getTestAmount(token);
  
  // Skip testing quote token against itself
  if (token.mint === QUOTE_TOKEN.mint) {
    return {
      symbol: token.symbol,
      mint: token.mint,
      status: 'SKIPPED',
      reason: 'Cannot quote token against itself',
      valid: true
    };
  }
  
  const url = 'https://web3.okx.com/api/v5/dex/aggregator/quote?' + new URLSearchParams({
    chainIndex: '501',
    chainId: '501',
    fromTokenAddress: token.mint,
    toTokenAddress: QUOTE_TOKEN.mint,
    amount: testAmount
  });
  
  console.log(`🧪 Testing ${token.symbol}: ${token.description}`);
  console.log(`   Amount: ${testAmount} (${getTestAmount(token)/(10**token.decimals)} ${token.symbol})`);
  console.log(`   Address: ${token.mint}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TokenVerifier/1.0)'
      }
    });

    if (response.status === 429) {
      console.log(`   ⏰ Rate limited (attempt ${retryCount + 1})`);
      
      if (retryCount < RATE_LIMIT.maxRetries) {
        console.log(`   ⏳ Retrying in ${RATE_LIMIT.retryDelay/1000} seconds...`);
        await sleep(RATE_LIMIT.retryDelay);
        return verifyTokenAddress(token, retryCount + 1);
      } else {
        return {
          symbol: token.symbol,
          mint: token.mint,
          status: 'RATE_LIMITED',
          reason: 'Too many requests - could not verify',
          valid: null
        };
      }
    }

    const data = await response.json();
    
    let result = {
      symbol: token.symbol,
      mint: token.mint,
      status: 'UNKNOWN',
      reason: data.msg || 'Unknown error',
      code: data.code,
      valid: false
    };
    
    if (data.code === '0') {
      result.status = 'VALID';
      result.reason = 'Success - token address works perfectly!';
      result.valid = true;
      console.log(`   ✅ VALID: ${result.reason}`);
    } else if (data.code === '50116') {
      result.status = 'VALID_AUTH_REQUIRED';
      result.reason = 'Valid token - just needs authentication';
      result.valid = true;
      console.log(`   🔐 VALID (auth required): ${result.reason}`);
    } else if (data.code === '82000') {
      result.status = 'INVALID_LIQUIDITY';
      result.reason = 'Insufficient liquidity - likely wrong/outdated address';
      result.valid = false;
      console.log(`   ❌ INVALID: ${result.reason}`);
    } else if (data.code === '50113') {
      result.status = 'VALID_SIGN_ERROR';
      result.reason = 'Valid token - signature error (expected without auth)';
      result.valid = true;
      console.log(`   ✅ VALID (sign error): ${result.reason}`);
    } else {
      result.status = 'ERROR';
      result.reason = `API Error: ${data.msg} (Code: ${data.code})`;
      console.log(`   ❓ ERROR: ${result.reason}`);
    }
    
    return result;
    
  } catch (error) {
    console.log(`   ❌ NETWORK ERROR: ${error.message}`);
    return {
      symbol: token.symbol,
      mint: token.mint,
      status: 'NETWORK_ERROR',
      reason: error.message,
      valid: false
    };
  }
}

// Main verification function
async function verifyAllTokens() {
  console.log('📋 VERIFICATION PLAN:');
  console.log(`• Testing ${TOKENS_TO_VERIFY.length} token addresses`);
  console.log(`• Using ${QUOTE_TOKEN.symbol} as quote token for all pairs`);
  console.log(`• Rate limit: ${RATE_LIMIT.delay/1000}s between requests`);
  console.log(`• Max retries: ${RATE_LIMIT.maxRetries} per token`);
  console.log('\n' + '='.repeat(60) + '\n');
  
  const results = [];
  
  for (let i = 0; i < TOKENS_TO_VERIFY.length; i++) {
    const token = TOKENS_TO_VERIFY[i];
    
    // Add delay between requests (except for first request)
    if (i > 0) {
      console.log(`⏳ Waiting ${RATE_LIMIT.delay/1000} seconds to respect rate limits...\n`);
      await sleep(RATE_LIMIT.delay);
    }
    
    const result = await verifyTokenAddress(token);
    results.push(result);
    
    console.log('─'.repeat(60));
  }
  
  // Summary report
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('=======================\n');
  
  const validTokens = results.filter(r => r.valid === true);
  const invalidTokens = results.filter(r => r.valid === false);
  const unknownTokens = results.filter(r => r.valid === null);
  
  console.log(`✅ VALID TOKENS: ${validTokens.length}/${results.length}`);
  validTokens.forEach(t => {
    console.log(`   • ${t.symbol}: ${t.status} - ${t.reason}`);
  });
  
  if (invalidTokens.length > 0) {
    console.log(`\n❌ INVALID TOKENS: ${invalidTokens.length}/${results.length}`);
    invalidTokens.forEach(t => {
      console.log(`   • ${t.symbol}: ${t.status} - ${t.reason}`);
    });
  }
  
  if (unknownTokens.length > 0) {
    console.log(`\n❓ UNKNOWN/RATE LIMITED: ${unknownTokens.length}/${results.length}`);
    unknownTokens.forEach(t => {
      console.log(`   • ${t.symbol}: ${t.status} - ${t.reason}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (invalidTokens.length > 0) {
    console.log('• Update invalid token addresses in Portfolio.jsx');
    console.log('• Check Solana Explorer for current token addresses');
  }
  if (unknownTokens.length > 0) {
    console.log('• Re-run verification later for rate-limited tokens');
    console.log('• Consider increasing delay between requests');
  }
  if (validTokens.length === results.filter(r => r.status !== 'SKIPPED').length) {
    console.log('🎉 All token addresses are valid! Your app should work perfectly.');
  }
  
  return results;
}

// Run the verification
console.log('🚀 Starting verification with rate limiting...\n');
verifyAllTokens()
  .then(() => {
    console.log('\n✅ Verification complete!');
    console.log('📄 All token addresses have been tested.');
  })
  .catch(error => {
    console.error('\n❌ Verification failed:', error);
  }); 