import React from 'react'
import ReactDOM from 'react-dom/client'
import { Web3OnboardProvider } from '@web3-onboard/react'
import { web3Onboard } from './web3-config'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      <App />
    </Web3OnboardProvider>
  </React.StrictMode>
) 