import React from 'react'
import ReactDOM from 'react-dom/client'
import { Web3OnboardProvider } from '@web3-onboard/react'
import { web3Onboard } from './web3-config'
import App from './App'
import './styles/index.scss'
import '@web3-onboard/core/styles.css'

// Initialize grid toggle
document.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.key === 'G') {
    document.getElementById('grid').classList.toggle('show')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      <App />
    </Web3OnboardProvider>
  </React.StrictMode>
) 