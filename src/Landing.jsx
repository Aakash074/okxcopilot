import React from 'react';
import okxcopilotLogo from './assets/okxcopilot.png';

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
    ),
    title: 'Connect Wallet',
    desc: 'Securely connect your Solana wallet to get started.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v1.5M3 7.5v9A2.25 2.25 0 0 0 5.25 18.75h13.5A2.25 2.25 0 0 0 21 16.5v-9M3 7.5h18" /></svg>
    ),
    title: 'View Portfolio',
    desc: 'See your real-time token balances and portfolio value.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
    ),
    title: 'AI Trade Suggestions',
    desc: 'Get personalized swap and trade ideas powered by AI.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5l-9 9m0-9l9 9" /></svg>
    ),
    title: 'OKX DEX Swaps',
    desc: 'Swap tokens instantly using the OKX DEX API.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25M12 18.75V21m8.25-9H21M3 12h2.25m13.364-6.364l-1.591 1.591M6.343 17.657l-1.591 1.591m13.364 0l-1.591-1.591M6.343 6.343L4.752 4.752" /></svg>
    ),
    title: 'Simulate & Optimize Gas',
    desc: 'Preview and optimize gas costs before executing swaps.'
  },
];

function Landing({ connectWallet, isDarkMode }) {
  return (
    <div className={`flex flex-col min-h-screen w-full ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700' : 'bg-gradient-to-br from-white via-blue-50 to-purple-100'}`}>
      {/* Hero Section */}
      <section id="home" className="flex flex-col-reverse md:flex-row items-center justify-between w-full px-0 sm:px-6 md:px-12 py-16 gap-12 md:gap-0">
        {/* Left: Text */}
        <div className="flex-grow basis-0 text-center md:text-left">
          <h1 className={`text-4xl sm:text-5xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} leading-tight mb-6`}>
            <span className="block">AI-Powered</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-green-400">OKX Copilot</span>
            <span className="block">for Solana DeFi</span>
          </h1>
          <p id="about" className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 w-full`}>
            Your all-in-one DeFi assistant: connect your wallet, view your portfolio, get AI trade suggestions, execute swaps, and optimize gas — all powered by OKX and Solana.
          </p>
          <button
            onClick={connectWallet}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-600 transition text-lg font-bold tracking-wide"
          >
            Connect Wallet
          </button>
        </div>
        {/* Right: Illustration */}
        <div className="flex-grow basis-0 flex items-center justify-center mb-10 md:mb-0">
          <img
            src={okxcopilotLogo}
            alt="OKX Copilot Logo"
            className="w-64 h-64 md:w-80 md:h-80 object-contain shadow-xl rounded-lg transition-transform hover:scale-105"
          />
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="w-full px-0 sm:px-6 md:px-12 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border hover:shadow-2xl transition`}>
            <div className="mb-4">{f.icon}</div>
            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Landing; 