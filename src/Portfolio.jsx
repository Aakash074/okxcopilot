import React, { useState, useEffect } from 'react';
import { getTokenPrice } from './okxDexApi';

const USDT_MINT = 'Es9vMFrzaCERk8b1uG8jB1r8bG7n1f5p1Q1Q1Q1Q1Q1Q'; // Solana USDT mint
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const SOL_SYMBOL = 'SOL';
const SOL_DECIMALS = 9;
const CHAIN_ID = '101'; // Solana mainnet

function Portfolio({ wallet, onTokenAction }) {
  const [portfolio, setPortfolio] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [selectedToken, setSelectedToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet || !window.okxwallet?.solana) return;
    setLoading(true);
    const fetchPortfolio = async () => {
      try {
        const provider = window.okxwallet.solana;
        // 1. Get SOL balance
        const solLamports = await provider.getBalance(wallet);
        const sol = solLamports / 1e9;
        let tokens = [{
          symbol: SOL_SYMBOL,
          mint: SOL_MINT,
          amount: sol,
          decimals: SOL_DECIMALS
        }];
        // 2. Get SPL token accounts
        const tokenAccounts = await provider.getTokenAccounts();
        // tokenAccounts: [{ mint, amount, decimals, symbol? }]
        for (const acc of tokenAccounts) {
          // skip wrapped SOL
          if (acc.mint === SOL_MINT) continue;
          tokens.push({
            symbol: acc.symbol || acc.mint.slice(0, 4),
            mint: acc.mint,
            amount: acc.amount / (10 ** acc.decimals),
            decimals: acc.decimals
          });
        }
        // 3. Fetch price for each token using OKX DEX API
        const tokensWithPrice = await Promise.all(tokens.map(async (t) => {
          try {
            const priceData = await getTokenPrice({
              chainId: CHAIN_ID,
              fromTokenAddress: t.mint,
              toTokenAddress: USDT_MINT,
              amount: (1 * 10 ** t.decimals).toString(),
              slippage: '0.5'
            });
            const price = Number(priceData.toTokenAmount) / 10 ** priceData.toTokenDecimals;
            return { ...t, price };
          } catch {
            return { ...t, price: 0 };
          }
        }));
        setPortfolio(tokensWithPrice);
        setTotalValue(tokensWithPrice.reduce((sum, t) => sum + t.amount * t.price, 0));
      } catch {
        setPortfolio([]);
        setTotalValue(0);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [wallet]);

  const handleTokenClick = (token) => {
    setSelectedToken(selectedToken === token ? null : token);
  };

  const handleTokenAction = (action, token, amount, price) => {
    const messages = {
      analyze: `Analyze my ${token} position. I currently hold ${amount} ${token} worth $${(amount * price).toFixed(2)}. What's your analysis?`,
      trade: `I want to trade my ${token}. I have ${amount} ${token}. What are the best trading opportunities right now?`,
      strategy: `Create a trading strategy for ${token}. My current position is ${amount} ${token} at $${price} each.`,
      price: `What's the price prediction for ${token}? Current price is $${price}.`
    };
    if (onTokenAction && messages[action]) {
      onTokenAction(messages[action]);
    }
    setSelectedToken(null);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-green-50 to-blue-100">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/30 bg-white/20 backdrop-blur-sm">
          <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Portfolio
          </div>
          <div className="text-xs sm:text-sm text-gray-500 font-mono truncate max-w-[120px] sm:max-w-xs">
            {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'No wallet'}
          </div>
        </div>
        {/* Total Value - Sticky */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-white via-green-50 to-blue-100 px-6 pt-6 pb-2">
          <div className="bg-white/80 rounded-xl p-6 shadow-lg border border-white/50">
            <div className="text-sm text-gray-600 mb-1">Total Portfolio Value</div>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? <span className="text-base text-gray-400">Loading...</span> : `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <div className="text-sm text-green-600 mt-1">+2.34% (24h)</div>
          </div>
        </div>
        {/* Portfolio Items - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-4 pt-4">
            <div className="text-base font-semibold text-gray-800 mb-4">Holdings (Click to interact)</div>
            {loading ? (
              <div className="text-gray-400 text-sm">Fetching balances...</div>
            ) : portfolio.length === 0 ? (
              <div className="text-gray-400 text-sm">No tokens found.</div>
            ) : portfolio.map(({ symbol, mint, amount, price }) => (
              <div key={mint} className="relative">
                <div
                  onClick={() => handleTokenClick(mint)}
                  className="bg-white/80 rounded-xl p-4 shadow-md border border-white/50 hover:shadow-lg transition-all cursor-pointer hover:bg-white/90"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {symbol.slice(0, 4)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{symbol}</div>
                        <div className="text-sm text-gray-600">{amount} tokens</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${isNaN(amount * price) ? '-' : (amount * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-600">
                        ${isNaN(price) ? '-' : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Action Menu */}
                {selectedToken === mint && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-20 p-2">
                    <div className="text-xs text-gray-600 mb-2 px-2">Ask AI about {symbol}:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleTokenAction('analyze', symbol, amount, price)}
                        className="text-xs px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        📊 Analyze
                      </button>
                      <button
                        onClick={() => handleTokenAction('trade', symbol, amount, price)}
                        className="text-xs px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        💱 Trade Ideas
                      </button>
                      <button
                        onClick={() => handleTokenAction('strategy', symbol, amount, price)}
                        className="text-xs px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                      >
                        🎯 Strategy
                      </button>
                      <button
                        onClick={() => handleTokenAction('price', symbol, amount, price)}
                        className="text-xs px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                      >
                        📈 Price Pred.
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio; 