import React from 'react';
import okxcopilotLogo from './assets/okxcopilot.png';

function Navbar({ wallet, connectWallet, disconnectWallet, isDarkMode, toggleTheme }) {
  return (
    <nav className={`w-full sticky top-0 z-30 ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur shadow-sm flex items-center justify-between px-6 py-3`}>
      <div className="flex items-center gap-3 min-w-[120px]">
        <img 
          src={okxcopilotLogo} 
          alt="OKX Copilot" 
          className="h-10 w-10 object-contain rounded-lg shadow-sm" 
        />
        <span className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight hidden sm:inline`}>OKX Copilot</span>
      </div>
      <div className="flex-1 flex justify-center">
        <div className={`flex gap-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold text-base`}>
          <a href="#home" className={`${isDarkMode ? 'hover:text-purple-400' : 'hover:text-purple-600'} transition`}>Home</a>
          <a href="#about" className={`${isDarkMode ? 'hover:text-purple-400' : 'hover:text-purple-600'} transition`}>About</a>
          <a href="#features" className={`${isDarkMode ? 'hover:text-purple-400' : 'hover:text-purple-600'} transition`}>Features</a>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
        
        {wallet ? (
          <>
            <div className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-xl text-sm font-mono`}>
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </div>
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-md hover:bg-red-600 transition text-sm font-semibold"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-white rounded-xl shadow-md hover:from-purple-700 hover:to-blue-600 transition text-base font-bold"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 