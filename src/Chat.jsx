import React, { useState, useRef, useEffect } from 'react';

function Chat({ wallet }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome! How can I help you?' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);

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

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');
  };

  return (
    <div className="flex flex-col w-full bg-gradient-to-br from-white via-blue-50 to-purple-100 flex-1">
      <section className="flex flex-col w-full flex-1 h-full px-0 sm:px-6 md:px-12 py-8">
        <div className="flex flex-col flex-1 w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between w-full px-6 py-4 border-b border-white/30 bg-white/40">
            <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              OKX Copilot Chat
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-mono truncate max-w-[120px] sm:max-w-xs">
              {wallet ? `Wallet: ${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'No wallet connected'}
            </div>
          </div>
          {/* Chat Messages */}
          <div className="flex-1 w-full h-0 px-4 py-6 overflow-y-auto space-y-4" style={{ minHeight: 0 }}>
            <div ref={messagesTopRef} />
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90vw] md:max-w-[60vw] px-4 py-2 rounded-2xl shadow-md text-base break-words
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
          {/* Chat Input */}
          <form
            onSubmit={sendMessage}
            className="flex gap-2 w-full px-4 py-4 border-t border-white/30 bg-white/40 sticky bottom-0 left-0 z-10"
          >
            <input
              className="flex-1 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 text-base shadow"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-600 transition text-base font-bold"
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Chat; 