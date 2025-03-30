import { useConnectWallet } from '@web3-onboard/react'
import { web3Onboard } from './web3-config'

function App() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

  return (
    <div>
      <button
        disabled={connecting}
        onClick={() => (wallet ? disconnect(wallet) : connect())}
      >
        {connecting ? 'Connecting...' : wallet ? 'Disconnect' : 'Connect Wallet'}
      </button>
      
      {wallet && (
        <div>
          <p>Connected: {wallet.accounts[0].address}</p>
          <p>Chain ID: {wallet.chains[0].id}</p>
        </div>
      )}
      
      {/* Your existing app content */}
    </div>
  )
}

export default App 