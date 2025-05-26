# OKX Copilot - AI Trading Strategy Assistant

A React-based DeFi portfolio management application that provides AI-powered trading strategies with integrated OKX wallet functionality.

## Features

### 🤖 AI Trading Strategies
- **JSON Response Format**: AI responses for trading strategies come in structured JSON format
- **Interactive Strategy Cards**: Each strategy is displayed as a card with swap functionality
- **OKX Wallet Integration**: Direct transaction execution through connected OKX wallet

### 📊 Portfolio Management
- **Real-time Portfolio**: View your Solana token holdings and values
- **4 Action Buttons**: 
  - 📊 **Analyze**: Get detailed analysis of your token positions
  - 💱 **Trade Ideas**: Receive AI-powered trading opportunities  
  - 🎯 **Strategy**: Get comprehensive trading strategies (returns JSON)
  - 📈 **Price Pred**: Get price predictions and market analysis

### 🔄 Swap Functionality
- **One-Click Swaps**: Execute trades directly from strategy cards
- **Real-time Quotes**: Get accurate pricing through OKX DEX API
- **Transaction Signing**: Secure transactions through OKX wallet

## AI Response Format

### Strategy/Trade Requests (JSON)
When users request trading strategies or opportunities, the AI returns structured JSON:

```json
{
  "strategies": [
    {
      "title": "Swap 50% of SOL to USDT",
      "description": "Based on current market trends, diversifying into USDT can help reduce volatility.",
      "fromToken": "SOL",
      "toToken": "USDT", 
      "amount": "50%",
      "estimatedToAmount": "24.7",
      "actionId": "swap-sol-to-usdt-1"
    }
  ]
}
```

### Analysis/Price Prediction (Text)
For analysis and price prediction requests, the AI returns detailed text responses.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
VITE_OKX_API_KEY=your_okx_api_key
VITE_OKX_SECRET_KEY=your_okx_secret_key  
VITE_OKX_API_PASSPHRASE=your_okx_passphrase
VITE_OKX_PROJECT_ID=your_okx_project_id
VITE_PPLX_API_KEY=your_perplexity_api_key
```

3. Run the development server:
```bash
npm run dev
```

## Architecture

- **Chat Component**: Handles both text and JSON responses from AI
- **StrategyCards Component**: Renders trading strategy cards with swap buttons
- **Portfolio Component**: Displays tokens with 4 action buttons
- **OKX DEX API**: Handles token pricing, quotes, and swap execution

## Supported Tokens

- SOL, USDT, USDC, wBTC, wETH, wBNB, JitoSOL
- All tokens use correct Solana mainnet addresses
- Automatic decimal handling for different token types

## Tech Stack

- React 19 + Vite
- Tailwind CSS for styling
- Axios for API calls
- CryptoJS for OKX API authentication
- OKX Wallet integration for Solana

## Troubleshooting

### Common Issues

#### 1. "Parameter chainId error"
- **Solution**: Ensure you're using chainId `'501'` for Solana mainnet, not `'101'`

#### 2. "Error fetching token price: AxiosError" / 429 Rate Limiting
- **Cause**: Missing or incorrect OKX API credentials
- **Solution**: 
  1. Create a `.env` file with your OKX API credentials:
  ```env
  VITE_OKX_API_KEY=your_key_here
  VITE_OKX_SECRET_KEY=your_secret_here
  VITE_OKX_API_PASSPHRASE=your_passphrase_here
  VITE_OKX_PROJECT_ID=your_project_id_here
  ```
  2. Get credentials from [OKX Developer Portal](https://www.okx.com/web3/build/docs/waas/introduction)

#### 3. Solana Token Addresses
- **SOL native**: `11111111111111111111111111111111` (32 ones)
- **Not**: `So11111111111111111111111111111111111111112` (wrapped SOL)

#### 4. Testing API Connection
- Use the included `test-api.js` file to verify your credentials:
  1. Update credentials in the file
  2. Run: `node test-api.js`

### Debug Console Logs
Check browser console for detailed API error responses including:
- Response status codes
- Detailed error messages from OKX API
- Environment variable status
