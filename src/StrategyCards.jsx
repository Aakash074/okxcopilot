import React, { useState } from 'react';
import { performSwap } from './okxDexApi';

function StrategyCards({ strategies, wallet, onSwapComplete }) {
  const [loadingSwaps, setLoadingSwaps] = useState({});

  const CHAIN_ID = '501'; // Solana mainnet (correct OKX chainId)
  
  // Token addresses mapping
  const TOKEN_ADDRESSES = {
    'SOL': '11111111111111111111111111111111',
    'USDT': 'Es9vMFrzaCERmqrGfGYpVeKWiNL5NqL7Edhgqk2z9kZi',
    'USDC': 'EPjFWdd5AufqSSqeM2qN3N3k5HHJh8N8HhjjHgU9h5FR',
    'wBTC': '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    'wETH': '7vfCXTUXx8kP4HT8YhJPgJ7Y4w6vjbQfgFQQs1nCJ3Kn',
    'wBNB': '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    'JitoSOL': 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'
  };

  const TOKEN_DECIMALS = {
    'SOL': 9,
    'USDT': 6,
    'USDC': 6,
    'wBTC': 6,
    'wETH': 8,
    'wBNB': 8,
    'JitoSOL': 9
  };

  const handleSwap = async (strategy) => {
    if (!wallet || !window.okxwallet?.solana) {
      alert('Please connect your OKX wallet first');
      return;
    }

    setLoadingSwaps(prev => ({ ...prev, [strategy.actionId]: true }));

    try {
      const fromTokenAddress = TOKEN_ADDRESSES[strategy.fromToken];
      const toTokenAddress = TOKEN_ADDRESSES[strategy.toToken];
      
      if (!fromTokenAddress || !toTokenAddress) {
        throw new Error(`Unsupported token: ${strategy.fromToken} or ${strategy.toToken}`);
      }

      // Convert amount to minimal units
      let amountInMinimalUnits;
      if (strategy.amount.includes('%')) {
        // For percentage-based amounts, we'd need to fetch current balance
        // For now, using a placeholder amount
        const percentage = parseFloat(strategy.amount.replace('%', ''));
        amountInMinimalUnits = (1000000 * percentage / 100).toString(); // Placeholder
      } else {
        const amount = parseFloat(strategy.amount);
        const decimals = TOKEN_DECIMALS[strategy.fromToken] || 9;
        amountInMinimalUnits = (amount * Math.pow(10, decimals)).toString();
      }

      // Get swap data from OKX API
      const swapData = await performSwap(
        fromTokenAddress,
        toTokenAddress,
        amountInMinimalUnits,
        {
          chainId: CHAIN_ID,
          slippage: '0.5',
          userWalletAddress: wallet
        }
      );

      // Execute the transaction using OKX wallet
      const provider = window.okxwallet.solana;
      const transaction = swapData.transactionPayload || swapData.tx; // The transaction data from OKX API
      
      console.log('Transaction data:', transaction);
      
      // Sign and send transaction
      const signature = await provider.signAndSendTransaction(transaction);
      
      console.log('Transaction successful:', signature);
      alert(`Swap completed! Transaction: ${signature}`);
      
      if (onSwapComplete) {
        onSwapComplete(strategy, signature);
      }

    } catch (error) {
      console.error('Swap failed:', error);
      alert(`Swap failed: ${error.message}`);
    } finally {
      setLoadingSwaps(prev => ({ ...prev, [strategy.actionId]: false }));
    }
  };

  if (!strategies || strategies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="text-sm font-semibold text-gray-800 mb-3">💡 AI Trading Strategies</div>
      {strategies.map((strategy) => (
        <div key={strategy.actionId} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200 shadow-md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-2">{strategy.title}</h3>
              <p className="text-xs text-gray-600 mb-3">{strategy.description}</p>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {strategy.fromToken.slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium">{strategy.fromToken}</span>
                </div>
                
                <div className="text-xs text-gray-400">→</div>
                
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {strategy.toToken.slice(0, 2)}
                  </div>
                  <span className="text-xs font-medium">{strategy.toToken}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500">Amount: </span>
                  <span className="font-medium">{strategy.amount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Est. receive: </span>
                  <span className="font-medium">{strategy.estimatedToAmount} {strategy.toToken}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSwap(strategy)}
            disabled={loadingSwaps[strategy.actionId]}
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-bold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingSwaps[strategy.actionId] ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Swapping...
              </div>
            ) : (
              '🔄 Swap Now'
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

export default StrategyCards; 