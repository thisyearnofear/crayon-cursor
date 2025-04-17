import React, { useState } from 'react';
import { useWallet } from '../utils/useWallet';

/**
 * Wallet Connect Button Component for React
 * @param {Object} props - Component props
 * @param {Function} props.onConnect - Callback when wallet is connected
 * @param {Function} props.onError - Callback when connection fails
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.style - Additional inline styles
 * @returns {JSX.Element} The wallet connect button
 */
export function WalletConnectButton({ 
  onConnect, 
  onError, 
  className = '', 
  style = {} 
}) {
  const { account, isConnected, connect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    if (isConnected) {
      if (onConnect) onConnect(account);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const newAccount = await connect();
      if (onConnect) onConnect(newAccount);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      if (onError) onError(err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Default button styles
  const defaultStyle = {
    background: isConnected ? '#22a722' : '#7A200C',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style
  };

  // Button text based on state
  const buttonText = isConnecting 
    ? 'Connecting...' 
    : isConnected 
      ? account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connected'
      : 'Connect Wallet';

  return (
    <div>
      <button 
        className={`wallet-connect-btn ${className}`}
        style={defaultStyle}
        onClick={handleConnect}
        disabled={isConnecting}
      >
        <span>{buttonText}</span>
      </button>
      {error && (
        <div style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default WalletConnectButton;
