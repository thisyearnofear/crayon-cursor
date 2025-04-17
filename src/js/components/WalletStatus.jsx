import React from 'react';
import { useWallet } from '../utils/useWallet';
import { WalletConnectButton } from './WalletConnectButton';

/**
 * Wallet Status Component for React
 * @param {Object} props - Component props
 * @returns {JSX.Element} The wallet status component
 */
export function WalletStatus() {
  const { account, isConnected, isInitialized } = useWallet();

  if (!isInitialized) {
    return <div>Loading wallet status...</div>;
  }

  return (
    <div className="wallet-status-container">
      {isConnected ? (
        <div className="wallet-connected">
          <div style={{ color: '#22a722', marginBottom: '8px' }}>
            <strong>Wallet Connected</strong>
          </div>
          <div>
            Account: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Unknown'}
          </div>
        </div>
      ) : (
        <div className="wallet-disconnected">
          <div style={{ color: '#D32F2F', marginBottom: '8px' }}>
            <strong>Wallet Not Connected</strong>
          </div>
          <div style={{ marginBottom: '12px' }}>
            Please connect your wallet to continue.
          </div>
          <WalletConnectButton 
            onConnect={(account) => console.log('Wallet connected:', account)}
            onError={(error) => console.error('Connection error:', error)}
          />
        </div>
      )}
    </div>
  );
}

export default WalletStatus;
