import React from 'react';

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

function Landing({ connectWallet }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-white via-blue-50 to-purple-100">
      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between w-full px-0 sm:px-6 md:px-12 py-16 gap-12 md:gap-0">
        {/* Left: Text */}
        <div className="flex-grow basis-0 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            <span className="block">AI-Powered</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-green-400">OKX Copilot</span>
            <span className="block">for Solana DeFi</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 w-full">
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
          {/* Modern AI/DeFi/OKX SVG illustration */}
          <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 md:w-80 md:h-80">
            <ellipse cx="160" cy="180" rx="120" ry="80" fill="url(#bg1)" />
            <circle cx="160" cy="120" r="60" fill="url(#bg2)" />
            <rect x="110" y="90" width="100" height="20" rx="10" fill="url(#bg3)" />
            <rect x="120" y="130" width="80" height="16" rx="8" fill="url(#bg4)" />
            <g filter="url(#glow)"><circle cx="160" cy="120" r="30" fill="#fff" fillOpacity="0.15" /></g>
            <defs>
              <radialGradient id="bg1" cx="0" cy="0" r="1" gradientTransform="translate(160 180) scale(120 80)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#6366F1" stopOpacity="0.2" />
              </radialGradient>
              <linearGradient id="bg2" x1="100" y1="60" x2="220" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FFA3" />
                <stop offset="1" stopColor="#DC1FFF" />
              </linearGradient>
              <linearGradient id="bg3" x1="110" y1="100" x2="210" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#19FB9B" />
                <stop offset="1" stopColor="#9945FF" />
              </linearGradient>
              <linearGradient id="bg4" x1="120" y1="138" x2="200" y2="138" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#00FFA3" />
              </linearGradient>
              <filter id="glow" x="110" y="70" width="100" height="100" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        </div>
      </section>
      {/* Features Section */}
      <section className="w-full px-0 sm:px-6 md:px-12 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-2xl transition">
            <div className="mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Landing; 