import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Landing from './Landing'
import Chat from './Chat'
import './App.css'
import { Connection, Transaction, SystemProgram } from '@solana/web3.js'

// const network = "https://api.mainnet-beta.solana.com"; // Remove unused

function App() {
  const [publicKey, setPublicKey] = useState(null)

  const connectWallet = async () => {
    try {
      const provider = window.okxwallet?.solana;
      if (!provider) throw new Error("OKX Wallet not found. Please install or enable it.");
      const response = await provider.connect();
      setPublicKey(response.publicKey.toString());
      console.log("Connected public key:", response.publicKey.toString());
    } catch (error) {
      console.error("Connection error:", error);
    }
  }

  useEffect(() => {
    const provider = window.okxwallet?.solana;
    if (!provider) return;
    const handleConnect = () => console.log("Wallet connected");
    const handleDisconnect = () => {
      setPublicKey(null);
      console.log("Wallet disconnected");
    };
    const handleAccountChanged = (pk) => {
      if (pk) {
        setPublicKey(pk.toBase58());
        console.log(`Switched to account ${pk.toBase58()}`);
      } else {
        setPublicKey(null);
        console.log("Account disconnected");
      }
    };
    provider.on("connect", handleConnect);
    provider.on("disconnect", handleDisconnect);
    provider.on("accountChanged", handleAccountChanged);
    return () => {
      provider.off("connect", handleConnect);
      provider.off("disconnect", handleDisconnect);
      provider.off("accountChanged", handleAccountChanged);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar wallet={publicKey} connectWallet={connectWallet} />
      <main className="flex-1 flex flex-col items-center justify-center">
        {!publicKey ? (
          <>
            <Landing connectWallet={connectWallet} />
            <button onClick={connectWallet} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Connect OKX Wallet</button>
          </>
        ) : (
          <Chat wallet={publicKey} />
        )}
      </main>
      {!publicKey && <Footer />}
    </div>
  )
}

export default App
