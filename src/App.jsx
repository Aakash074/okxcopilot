import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Landing from './Landing'
import Chat from './Chat'
import Portfolio from './Portfolio'
import './App.css'
import { Connection, Transaction, SystemProgram } from '@solana/web3.js'

// const network = "https://api.mainnet-beta.solana.com"; // Remove unused

function App() {
  const [publicKey, setPublicKey] = useState(null)
  const [externalMessage, setExternalMessage] = useState(null)

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

  const disconnectWallet = async () => {
    try {
      const provider = window.okxwallet?.solana;
      if (provider) {
        await provider.disconnect();
      }
      setPublicKey(null);
      setExternalMessage(null); // Clear any pending external messages
      console.log("Wallet disconnected");
    } catch (error) {
      console.error("Disconnect error:", error);
      // Force disconnect even if there's an error
      setPublicKey(null);
      setExternalMessage(null);
    }
  }

  const handleTokenAction = (message) => {
    setExternalMessage(message);
  };

  const handleExternalMessageHandled = () => {
    setExternalMessage(null);
  };

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
    <div className={`flex flex-col bg-gray-50 ${publicKey ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar wallet={publicKey} connectWallet={connectWallet} disconnectWallet={disconnectWallet} />
      <main className={`flex-1 flex ${publicKey ? 'overflow-hidden' : ''}`}>
        {!publicKey ? (
          <div className="flex-1 overflow-y-auto">
            <Landing connectWallet={connectWallet} />
          </div>
        ) : (
          <div className="flex w-full h-full overflow-hidden">
            {/* Portfolio - Left Half */}
            <div className="w-1/2 h-full border-r border-gray-200 overflow-hidden">
              <Portfolio wallet={publicKey} onTokenAction={handleTokenAction} />
            </div>
            {/* Chat - Right Half */}
            <div className="w-1/2 h-full overflow-hidden">
              <Chat wallet={publicKey} externalMessage={externalMessage} onExternalMessageHandled={handleExternalMessageHandled} />
            </div>
          </div>
        )}
      </main>
      {!publicKey && <Footer />}
    </div>
  )
}

export default App
