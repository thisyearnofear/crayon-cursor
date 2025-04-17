/**
 * Wallet Bridge - Provides access to the wallet instance for React components
 * This file bridges the gap between vanilla JS and React components
 */

import wallet from '../components/wallet';

// Create a global wallet bridge object
const walletBridge = {
  // Reference to the wallet instance
  wallet,
  
  // Method to get the current wallet instance
  getWallet() {
    return wallet;
  },
  
  // Method to check if wallet is connected
  isConnected() {
    return wallet && wallet.getAccount && !!wallet.getAccount();
  },
  
  // Method to get the current account
  getAccount() {
    return wallet && wallet.getAccount ? wallet.getAccount() : null;
  },
  
  // Method to connect the wallet
  async connect() {
    if (wallet && wallet.connect) {
      return await wallet.connect();
    }
    throw new Error('Wallet not available');
  },
  
  // Method to add a connection change listener
  onConnectionChange(callback) {
    if (wallet && wallet.onChange) {
      wallet.onChange(callback);
    }
  }
};

// Expose the wallet bridge to the window object for React to access
window.walletBridge = walletBridge;

// Also export it for direct imports in React
export default walletBridge;
