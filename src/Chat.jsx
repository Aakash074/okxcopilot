import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getStrategySuggestion } from './okxDexApi';
import StrategyCards from './StrategyCards';
import 'highlight.js/styles/github.css';

// Component to render markdown content with proper styling
const MarkdownMessage = ({ content, isUser }) => {
  const baseClasses = `max-w-[85%] px-4 py-2 rounded-2xl shadow-md text-sm break-words`;
  const userClasses = `bg-gradient-to-r from-purple-500 to-blue-400 text-white rounded-br-sm`;
  const botClasses = `bg-white/80 text-gray-900 border border-gray-200 rounded-bl-sm`;
  
  return (
    <div className={`${baseClasses} ${isUser ? userClasses : botClasses}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for markdown elements
          h1: ({ children }) => <h1 className={`text-lg font-bold mb-2 ${isUser ? 'text-white' : 'text-gray-900'}`}>{children}</h1>,
          h2: ({ children }) => <h2 className={`text-md font-bold mb-2 ${isUser ? 'text-white' : 'text-gray-800'}`}>{children}</h2>,
          h3: ({ children }) => <h3 className={`text-sm font-bold mb-1 ${isUser ? 'text-white' : 'text-gray-700'}`}>{children}</h3>,
          p: ({ children }) => <p className={`mb-2 last:mb-0 ${isUser ? 'text-white' : 'text-gray-900'}`}>{children}</p>,
          ul: ({ children }) => <ul className={`list-disc list-inside mb-2 ${isUser ? 'text-white' : 'text-gray-900'}`}>{children}</ul>,
          ol: ({ children }) => <ol className={`list-decimal list-inside mb-2 ${isUser ? 'text-white' : 'text-gray-900'}`}>{children}</ol>,
          li: ({ children }) => <li className={`mb-1 ${isUser ? 'text-white' : 'text-gray-900'}`}>{children}</li>,
          strong: ({ children }) => <strong className={`font-bold ${isUser ? 'text-white' : 'text-gray-900'}`}>{children}</strong>,
          em: ({ children }) => <em className={`italic ${isUser ? 'text-white' : 'text-gray-800'}`}>{children}</em>,
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <code className={`block bg-gray-100 rounded p-2 my-2 text-gray-800 text-xs overflow-x-auto ${className || ''}`}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`${isUser ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-800'} px-1 py-0.5 rounded text-xs`}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-100 rounded p-2 my-2 text-gray-800 text-xs overflow-x-auto">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 ${isUser ? 'border-white/30 bg-white/10' : 'border-gray-300 bg-gray-50'} pl-3 py-1 my-2 italic ${isUser ? 'text-white' : 'text-gray-700'}`}>
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className={`underline ${isUser ? 'text-white hover:text-gray-200' : 'text-blue-600 hover:text-blue-800'}`}>
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

function Chat({ wallet, externalMessage, onExternalMessageHandled }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome! How can I help you? Click on any token in your portfolio to get AI insights!', type: 'text' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState({});
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);

  // Fetch real portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!wallet || !window.okxwallet?.solana) {
        setPortfolio({});
        return;
      }

      try {
        // Create a connection to Solana RPC
        const { Connection, PublicKey } = await import('@solana/web3.js');
        const rpcEndpoints = [
          'https://api.mainnet-beta.solana.com',
          'https://solana-rpc.publicnode.com',
          'https://solana.drpc.org',
          'https://rpc.ankr.com/solana',
          'https://endpoints.omniatech.io/v1/sol/mainnet/public'
        ];
        
        let connection;
        for (const endpoint of rpcEndpoints) {
          try {
            connection = new Connection(endpoint);
            await connection.getLatestBlockhash();
            break;
          } catch (rpcError) {
            console.warn(`Failed to connect to ${endpoint}:`, rpcError.message);
            continue;
          }
        }
        
        if (!connection) {
          console.warn('Failed to connect to Solana RPC');
          return;
        }
        
        const walletPubkey = new PublicKey(wallet);
        
        // Get SOL balance
        const solLamports = await connection.getBalance(walletPubkey);
        const sol = solLamports / 1e9;
        
        // Get SPL token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        });
        
        // Parse token balances
        const balances = { SOL: sol };
        for (const { account } of tokenAccounts.value) {
          try {
            if (account.data?.parsed?.info) {
              const info = account.data.parsed.info;
              const mint = info.mint;
              const amount = info.tokenAmount.uiAmount || 0;
              
              // Map common token mints to symbols
              const tokenMintToSymbol = {
                'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
                'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
                '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': 'wBTC',
                '7vfCXTUXx8kP4HT8YhJPgJ7Y4w6vjbQfgFQQs1nCJ3Kn': 'wETH',
                '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM': 'wBNB'
              };
              
              const symbol = tokenMintToSymbol[mint];
              if (symbol && amount > 0) {
                balances[symbol] = amount;
              }
            }
          } catch (parseError) {
            console.warn('Error parsing token account:', parseError);
          }
        }
        
        setPortfolio(balances);
        console.log('Portfolio data updated for chat:', balances);
      } catch (error) {
        console.error('Error fetching portfolio data for chat:', error);
        setPortfolio({});
      }
    };

    fetchPortfolioData();
  }, [wallet]);

  const sendExternalMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || loading) return;
    const userMsg = { from: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { from: 'bot', text: 'Thinking...' }]);
    try {
      const reply = await getStrategySuggestion(messageText, { ...portfolio, wallet });
      if (reply.type === 'json') {
        setMessages(prev => [
          ...prev.slice(0, -1), // remove 'Thinking...'
          { from: 'bot', text: '', type: 'json', data: reply.data }
        ]);
      } else {
        setMessages(prev => [
          ...prev.slice(0, -1), // remove 'Thinking...'
          { from: 'bot', text: reply.data || 'No suggestion available.', type: 'text' }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { from: 'bot', text: 'Error: ' + (err.message || 'Failed to get suggestion.'), type: 'text' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, portfolio, wallet]);

  // Handle external messages from Portfolio
  useEffect(() => {
    if (externalMessage) {
      // Don't set input, just send the message directly
      sendExternalMessage(externalMessage);
      if (onExternalMessageHandled) {
        onExternalMessageHandled();
      }
    }
  }, [externalMessage, sendExternalMessage, onExternalMessageHandled]);

  // Always scroll to top on load (show first message)
  useEffect(() => {
    messagesTopRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);
  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { from: 'bot', text: 'Thinking...' }]);
    try {
      const reply = await getStrategySuggestion(currentInput, { ...portfolio, wallet });
      if (reply.type === 'json') {
        setMessages(prev => [
          ...prev.slice(0, -1), // remove 'Thinking...'
          { from: 'bot', text: '', type: 'json', data: reply.data }
        ]);
      } else {
        setMessages(prev => [
          ...prev.slice(0, -1), // remove 'Thinking...'
          { from: 'bot', text: reply.data || 'No suggestion available.', type: 'text' }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { from: 'bot', text: 'Error: ' + (err.message || 'Failed to get suggestion.'), type: 'text' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-blue-50 to-purple-100">
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/30 bg-white/20 backdrop-blur-sm">
          <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            OKX Copilot Chat
          </div>
          <div className="text-xs sm:text-sm text-gray-500 font-mono truncate max-w-[120px] sm:max-w-xs">
            {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'No wallet'}
          </div>
        </div>
        
        {/* Chat Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ minHeight: 0 }}>
          <div ref={messagesTopRef} />
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'json' && msg.from === 'bot' ? (
                <div className="max-w-[85%] w-full">
                  <StrategyCards 
                    strategies={msg.data?.strategies || []} 
                    wallet={wallet}
                    portfolio={portfolio}
                    onSwapComplete={(strategy, signature) => {
                      console.log('Swap completed:', strategy, signature);
                      // Optionally add a confirmation message
                    }}
                  />
                </div>
              ) : (
                <MarkdownMessage 
                  content={msg.text} 
                  isUser={msg.from === 'user'} 
                />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input - Fixed at bottom */}
        <div className="px-6 py-4 border-t border-white/30 bg-white/20 backdrop-blur-sm">
          {/* Test Button for Demo */}
          <div className="mb-2">
            <button
              onClick={() => {
                const testStrategies = {
                  "strategies": [
                    {
                      "title": "Swap 50% of SOL to USDT",
                      "description": "Based on current market trends, diversifying into USDT can help reduce volatility.",
                      "fromToken": "SOL",
                      "toToken": "USDT",
                      "amount": "50%",
                      "estimatedToAmount": "24.7",
                      "actionId": "swap-sol-to-usdt-1"
                    },
                    {
                      "title": "Swap 100 USDC to JitoSOL",
                      "description": "JitoSOL is earning yield. Swapping idle USDC here could be profitable.",
                      "fromToken": "USDC",
                      "toToken": "JitoSOL",
                      "amount": "100",
                      "estimatedToAmount": "1.3",
                      "actionId": "swap-usdc-to-jitosol-2"
                    }
                  ]
                };
                setMessages(prev => [...prev, 
                  { from: 'user', text: 'Show me trading strategies', type: 'text' },
                  { from: 'bot', text: '', type: 'json', data: testStrategies }
                ]);
              }}
              className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition mr-2"
            >
              🧪 Test JSON Strategies
            </button>
            {/* <button
              onClick={() => {
                const markdownText = `# Portfolio Analysis

## Current Holdings Overview
Your portfolio shows **strong diversification** across multiple tokens:

### Key Metrics:
- **Total Value**: $1,234.56
- **24h Change**: +5.2% 📈
- **Risk Level**: Moderate

### Token Breakdown:
1. **SOL**: 45% allocation
   - Current Price: $180.25
   - Recommendation: *Consider taking profits*
2. **USDT**: 30% allocation  
   - Stable asset for \`hedging\`
3. **ETH**: 25% allocation
   - Strong fundamentals

### Trading Suggestions:

> **Tip**: Consider rebalancing when any single asset exceeds 50% of your portfolio.

#### Recommended Actions:
- [ ] Swap 10% SOL → USDT (risk management)
- [ ] DCA into ETH during dips
- [ ] Monitor BTC/SOL correlation

\`\`\`javascript
// Example API call
const portfolio = await getPortfolio(wallet);
console.log(portfolio.totalValue);
\`\`\`

**Next Steps**: 
- Use the **Portfolio** section to execute swaps
- Ask me for specific trading strategies
- Click any token for detailed analysis

---
*Analysis powered by OKX Copilot AI* ⚡`;
                
                setMessages(prev => [...prev, 
                  { from: 'user', text: 'Analyze my portfolio', type: 'text' },
                  { from: 'bot', text: markdownText, type: 'text' }
                ]);
              }}
              className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mr-2"
            >
              📊 Test Markdown
            </button> */}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              className="flex-1 border-none text-black rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 text-sm shadow"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              autoFocus
              disabled={loading}
            />
            <button
              type="submit"
              className="px-4 py-3 bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-600 transition text-sm font-bold"
              disabled={loading}
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat; 