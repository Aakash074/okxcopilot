import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getStrategySuggestion } from './okxDexApi';

function Chat({ wallet, externalMessage, onExternalMessageHandled }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome! How can I help you? Click on any token in your portfolio to get AI insights!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);

  // Placeholder: Replace with real portfolio fetching logic
  const portfolio = { USDT: 1000, ETH: 0.5 };

  const sendExternalMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || loading) return;
    const userMsg = { from: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { from: 'bot', text: 'Thinking...' }]);
    try {
      const reply = await getStrategySuggestion(messageText, { ...portfolio, wallet });
      setMessages(prev => [
        ...prev.slice(0, -1), // remove 'Thinking...'
        { from: 'bot', text: reply || 'No suggestion available.' }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { from: 'bot', text: 'Error: ' + (err.message || 'Failed to get suggestion.') }
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
      setMessages(prev => [
        ...prev.slice(0, -1), // remove 'Thinking...'
        { from: 'bot', text: reply || 'No suggestion available.' }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { from: 'bot', text: 'Error: ' + (err.message || 'Failed to get suggestion.') }
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
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-md text-sm break-words
                  ${msg.from === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-400 text-white rounded-br-sm'
                    : 'bg-white/80 text-gray-900 border border-gray-200 rounded-bl-sm'}
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input - Fixed at bottom */}
        <div className="px-6 py-4 border-t border-white/30 bg-white/20 backdrop-blur-sm">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              className="flex-1 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 text-sm shadow"
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