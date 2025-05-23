import React from 'react';

function Navbar({ wallet, connectWallet }) {
  return (
    <nav className="w-full sticky top-0 z-30 bg-white/90 backdrop-blur shadow-sm flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2 min-w-[120px]">
        <img src="/okx-logo.svg" alt="OKX Copilot" className="h-8 w-8 object-contain" onError={e => { e.target.style.display = 'none'; }} />
        <span className="text-xl font-extrabold text-gray-900 tracking-tight hidden sm:inline">OKX Copilot</span>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="flex gap-8 text-gray-700 font-semibold text-base">
          <a href="#home" className="hover:text-purple-600 transition">Home</a>
          <a href="#about" className="hover:text-purple-600 transition">About</a>
          <a href="#features" className="hover:text-purple-600 transition">Features</a>
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={connectWallet}
          className="ml-4 px-5 py-2 bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-white rounded-xl shadow-md hover:from-purple-700 hover:to-blue-600 transition text-base font-bold"
        >
          {wallet ? `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar; 