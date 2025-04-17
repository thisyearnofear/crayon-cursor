// wallet.js
// Simple MetaMask + ethers.js wallet integration for minting
import { ethers } from "ethers";

class Wallet {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.ensName = null;
    this.avatar = null;
    this.profileCallbacks = [];
    this.callbacks = [];

    // Initialize async
    this._initAsync();
  }

  async _initAsync() {
    try {
      await this._setup();
      console.log("Wallet initialization complete");
    } catch (error) {
      console.error("Error initializing wallet:", error);
    }
  }

  async getProfile(address) {
    try {
      const res = await fetch(`https://api.web3.bio/ns/${address}`);
      if (!res.ok) return null;
      const profiles = await res.json();
      // Prefer ENS, fallback to first
      const ens = profiles.find((p) => p.platform === "ens");
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
    this.profileCallbacks.forEach((cb) =>
      cb({ ensName: this.ensName, avatar: this.avatar, account: this.account })
    );
  }

  onProfileChange(cb) {
    this.profileCallbacks.push(cb);
  }

  getDisplayName() {
    if (this.ensName) return this.ensName;
    if (this.account)
      return this.account.slice(0, 6) + "..." + this.account.slice(-4);
    return "";
  }

  async _setup() {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        this.account = accounts[0] || null;
        console.log(
          "Wallet: accountsChanged event, new account:",
          this.account
        );
        this._notify();
        this.updateProfile();
      });

      // Check if already connected
      try {
        console.log("Wallet: checking for existing connection...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts && accounts.length > 0) {
          this.provider = provider;
          this.account = accounts[0].address;
          this.signer = await provider.getSigner();
          console.log(
            "Wallet: found existing connection, account:",
            this.account
          );
          this._notify();
          this.updateProfile();
        } else {
          console.log("Wallet: no existing connection found");
        }
      } catch (error) {
        console.warn("Wallet: error checking for existing connection:", error);
      }
    }
  }

  async connect() {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }
    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      this.account = accounts[0];
      this.signer = await this.provider.getSigner();
      this._notify();
      await this.updateProfile();
      return this.account;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  onChange(cb) {
    this.callbacks.push(cb);
  }

  _notify() {
    this.callbacks.forEach((cb) => cb(this.account));
  }

  isConnected() {
    const connected = !!this.account;
    console.log(
      "Wallet.isConnected() called, result:",
      connected,
      "account:",
      this.account
    );
    return connected;
  }

  getAccount() {
    console.log("Wallet.getAccount() called, account:", this.account);
    return this.account;
  }

  /**
   * Creates a wallet connection button that can be added to any UI
   * @param {Object} options - Button options
   * @param {string} [options.container] - Container element ID to append the button to
   * @param {Function} [options.onConnect] - Callback when wallet is connected
   * @param {Function} [options.onError] - Callback when connection fails
   * @returns {HTMLElement} The created button element
   */
  createConnectButton(options = {}) {
    const { container, onConnect, onError } = options;

    // Create button
    const button = document.createElement("button");
    button.className = "wallet-connect-btn";
    button.style.cssText = `
      background: #7A200C;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    `;

    // Update button state
    const updateButtonState = () => {
      if (this.isConnected()) {
        button.innerHTML = `
          <span>${this.getDisplayName()}</span>
        `;
        button.style.background = "#22a722";
      } else {
        button.innerHTML = `
          <span>Connect Wallet</span>
        `;
        button.style.background = "#7A200C";
      }
    };

    // Initial state
    updateButtonState();

    // Add click handler
    button.onclick = async () => {
      if (this.isConnected()) {
        // Already connected
        if (onConnect) onConnect(this.account);
        return;
      }

      try {
        button.disabled = true;
        button.innerHTML = "<span>Connecting...</span>";

        const account = await this.connect();
        updateButtonState();

        if (onConnect) onConnect(account);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        button.innerHTML = "<span>Connection Failed</span>";
        button.style.background = "#D32F2F";

        setTimeout(() => {
          updateButtonState();
        }, 2000);

        if (onError) onError(error);
      } finally {
        button.disabled = false;
      }
    };

    // Listen for account changes
    this.onChange(() => {
      updateButtonState();
    });

    // Append to container if provided
    if (container) {
      const containerEl = document.getElementById(container);
      if (containerEl) containerEl.appendChild(button);
    }

    return button;
  }
}

const wallet = new Wallet();

// Expose the wallet instance to the window object
window.wallet = wallet;

export default wallet;
