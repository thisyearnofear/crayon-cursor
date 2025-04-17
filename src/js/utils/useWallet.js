/**
 * React hook for accessing the wallet
 * This hook provides access to the wallet instance from React components
 */

import { useState, useEffect } from 'react';

/**
 * Hook to access the wallet from React components
 * @returns {Object} Wallet state and methods
 */
export function useWallet() {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if the wallet bridge is available
    if (window.walletBridge) {
      // Get initial state
      setAccount(window.walletBridge.getAccount());
      setIsConnected(window.walletBridge.isConnected());
      setIsInitialized(true);

      // Listen for changes
      const handleAccountChange = (newAccount) => {
        console.log('React wallet hook: account changed', newAccount);
        setAccount(newAccount);
        setIsConnected(!!newAccount);
      };

      // Add listener
      window.walletBridge.onConnectionChange(handleAccountChange);
    } else if (window.wallet) {
      // Fallback to direct wallet access
      setAccount(window.wallet.getAccount && window.wallet.getAccount());
      setIsConnected(window.wallet.isConnected && window.wallet.isConnected());
      setIsInitialized(true);

      // Listen for changes
      const handleAccountChange = (newAccount) => {
        console.log('React wallet hook: account changed (direct)', newAccount);
        setAccount(newAccount);
        setIsConnected(!!newAccount);
      };

      // Add listener
      window.wallet.onChange(handleAccountChange);
    } else {
      console.warn('Wallet bridge not available');
      setIsInitialized(true);
    }
  }, []);

  /**
   * Connect to the wallet
   * @returns {Promise<string>} The connected account
   */
  const connect = async () => {
    try {
      if (window.walletBridge) {
        return await window.walletBridge.connect();
      } else if (window.wallet && window.wallet.connect) {
        return await window.wallet.connect();
      }
      throw new Error('Wallet not available');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  return {
    account,
    isConnected,
    isInitialized,
    connect,
  };
}

export default useWallet;
