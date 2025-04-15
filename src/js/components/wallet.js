// wallet.js
// Simple MetaMask + ethers.js wallet integration for minting
import { ethers } from 'ethers';

class Wallet {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.ensName = null;
    this.avatar = null;
    this.profileCallbacks = [];
    this.callbacks = [];
    this._setup();
  }

  async getProfile(address) {
    try {
      const res = await fetch(`https://api.web3.bio/ns/${address}`);
      if (!res.ok) return null;
      const profiles = await res.json();
      // Prefer ENS, fallback to first
      const ens = profiles.find(p => p.platform === 'ens');
      return ens || profiles[0] || null;
    } catch {
      return null;
    }
  }

  async updateProfile() {
    if (!this.account) return;
    const profile = await this.getProfile(this.account);
    this.ensName = profile && profile.displayName ? profile.displayName : null;
    this.avatar = profile && profile.avatar ? profile.avatar : null;
    this.profileCallbacks.forEach(cb => cb({ ensName: this.ensName, avatar: this.avatar, account: this.account }));
  }

  onProfileChange(cb) {
    this.profileCallbacks.push(cb);
  }

  getDisplayName() {
    if (this.ensName) return this.ensName;
    if (this.account) return this.account.slice(0,6) + '...' + this.account.slice(-4);
    return '';
  }

  _setup() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        this.account = accounts[0] || null;
        this._notify();
        this.updateProfile();
      });
    }
  }

  async connect() {
    if (!window.ethereum) {
      alert('MetaMask not detected. Please install MetaMask.');
      return;
    }
    this.provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.account = accounts[0];
    this.signer = await this.provider.getSigner();
    this._notify();
    await this.updateProfile();
  }

  onChange(cb) {
    this.callbacks.push(cb);
  }

  _notify() {
    this.callbacks.forEach(cb => cb(this.account));
  }

  isConnected() {
    return !!this.account;
  }

  getAccount() {
    return this.account;
  }

}

const wallet = new Wallet();
export default wallet;
