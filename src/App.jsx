import { useConnectWallet } from '@web3-onboard/react'
import { web3Onboard } from './web3-config'
import QuillGame from './components/QuillGame'
import { SignatureCanvas } from './components/SignatureCanvas'
import { useState, useEffect } from 'react'
import './styles/app.css'

function App() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [mode, setMode] = useState('signature')
  const [canvasManager, setCanvasManager] = useState(null)

  useEffect(() => {
    // Initialize canvas manager
    if (!canvasManager) {
      const manager = new CanvasManager()
      setCanvasManager(manager)
    }

    // Add click handler to title
    const title = document.getElementById('title')
    if (title) {
      title.addEventListener('click', handleModeToggle)
    }

    return () => {
      if (canvasManager) {
        canvasManager.cleanup?.()
      }
      if (title) {
        title.removeEventListener('click', handleModeToggle)
      }
    }
  }, [])

  const handleModeToggle = () => {
    const newMode = mode === 'signature' ? 'quill' : 'signature'
    setMode(newMode)
    
    if (canvasManager) {
      canvasManager.cleanup()
      if (newMode === 'quill') {
        canvasManager.initQuillMode()
      } else {
        canvasManager.initSignatureMode()
      }
    }
  }

  return (
    <div className="app">
      <div className="app-controls">
        <button
          className="mode-toggle-btn"
          onClick={handleModeToggle}
        >
          {mode === 'signature' ? 'Switch to Quill' : 'Switch to Signature'}
        </button>
        <button
          className="wallet-btn"
          disabled={connecting}
          onClick={() => (wallet ? disconnect(wallet) : connect())}
        >
          {connecting ? 'Connecting...' : wallet ? 'Disconnect' : 'Connect Wallet'}
        </button>
      </div>
      
      {wallet && (
        <div className="wallet-info">
          <p>Connected: {wallet.accounts[0].address}</p>
          <p>Chain ID: {wallet.chains[0].id}</p>
        </div>
      )}
      
      <main className="app-main">
        {mode === 'signature' ? (
          <div className="signature-mode">
            <SignatureCanvas />
          </div>
        ) : (
          <div className="quill-mode">
            <QuillGame />
          </div>
        )}
      </main>
    </div>
  )
}

export default App 