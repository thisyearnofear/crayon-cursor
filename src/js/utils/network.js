/**
 * Network utility functions
 */

/**
 * Check if the user's wallet is connected to the Base network
 * @returns {Promise<boolean>} True if connected to Base, false otherwise
 */
export async function isConnectedToBase() {
  try {
    if (!window.ethereum) {
      console.warn('No ethereum provider found');
      return false;
    }
    
    // Get the current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Base mainnet chain ID is 0x2105 (8453 in decimal)
    const baseChainId = '0x2105';
    
    // Check if the current chain ID matches Base
    const isBase = chainId === baseChainId;
    
    console.log(`Current chain ID: ${chainId}, Base chain ID: ${baseChainId}, Is Base: ${isBase}`);
    
    return isBase;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

/**
 * Switch the user's wallet to the Base network
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function switchToBase() {
  try {
    if (!window.ethereum) {
      console.warn('No ethereum provider found');
      return false;
    }
    
    // Base mainnet chain ID is 0x2105 (8453 in decimal)
    const baseChainId = '0x2105';
    
    try {
      // Try to switch to Base
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: baseChainId }],
      });
      
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: baseChainId,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
          
          return true;
        } catch (addError) {
          console.error('Error adding Base network:', addError);
          return false;
        }
      }
      
      console.error('Error switching to Base network:', switchError);
      return false;
    }
  } catch (error) {
    console.error('Error switching network:', error);
    return false;
  }
}

export default {
  isConnectedToBase,
  switchToBase,
};
