import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import { ethers } from "ethers";
import { IdentityResolver } from "./utils/identity-resolver.js";

export class WalletManager {
  constructor() {
    // Initialize injected wallets module
    const injected = injectedModule();

    // Initialize identity resolver
    this.identityResolver = new IdentityResolver();

    // Initialize Web3-Onboard with configuration
    this.onboard = Onboard({
      wallets: [injected],
      chains: [
        {
          id: "0x1",
          token: "ETH",
          label: "Ethereum Mainnet",
          rpcUrl:
            "https://mainnet.infura.io/v3/17c1e1500e384acfb6a72c5d2e67742e",
        },
        {
          id: "0x89",
          token: "MATIC",
          label: "Polygon Mainnet",
          rpcUrl: "https://polygon-rpc.com",
        },
        {
          id: "0x2105",
          token: "ETH",
          label: "Base",
          rpcUrl: "https://mainnet.base.org",
        },
      ],
      appMetadata: {
        name: "Crayon Cursor",
        icon: `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#7A200C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="#7A200C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="#7A200C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        description:
          "Create and share your digital signatures on the blockchain",
        recommendedInjectedWallets: [
          { name: "MetaMask", url: "https://metamask.io" },
          { name: "Coinbase Wallet", url: "https://www.coinbase.com/wallet" },
          { name: "Trust Wallet", url: "https://trustwallet.com" },
        ],
      },
      i18n: {
        en: {
          connect: {
            selectingWallet: {
              header: "Select a Wallet",
              sidebar: {
                title: "What is a Wallet?",
                subtitle:
                  "Wallets are used to send, receive, store, and interact with digital assets on the blockchain.",
                paragraph:
                  "Wallets are used to send, receive, store, and interact with digital assets on the blockchain. Wallets are used to send, receive, store, and interact with digital assets on the blockchain.",
                recommendedWallets: "Recommended Wallets",
                agreement: "I agree to the {terms} and {privacy}",
              },
              primaryButton: "Connect Wallet",
              secondaryButton: "What is a Wallet?",
              recommendedWallets: "Recommended Wallets",
              otherWallets: "Other Wallets",
              agreement: "I agree to the {terms} and {privacy}",
            },
            connectingWallet: {
              header: "Connect {wallet}",
              paragraph: "Please follow the prompts in your wallet to connect.",
              primaryButton: "Back",
              secondaryButton: "Try Again",
              rejectButton: "Cancel Connection",
              previousConnection: "Previous Connection",
            },
            connectedWallet: {
              header: "Connected to {wallet}",
              paragraph: "Connected to {wallet}",
              primaryButton: "Disconnect",
              secondaryButton: "Change Wallet",
              subheader: "Connected to {wallet}",
              showAccountCenter: "Show Account Center",
              disconnectWallet: "Disconnect {wallet}",
            },
            errorWallet: {
              header: "Connection Error",
              paragraph: "There was an error connecting to {wallet}",
              primaryButton: "Back",
              secondaryButton: "Try Again",
            },
            rejectWallet: {
              header: "Connection Rejected",
              paragraph: "You rejected the connection to {wallet}",
              primaryButton: "Back",
              secondaryButton: "Try Again",
            },
          },
          accountCenter: {
            connect: "Connect Wallet",
            disconnect: "Disconnect",
            copyAddress: "Copy Address",
            addressCopied: "Address Copied!",
            balance: "Balance",
            network: "Network",
            selectNetwork: "Select Network",
            appInfo: "App Info",
            learnMore: "Learn More",
            getStarted: "Get Started",
            recommendedWallets: "Recommended Wallets",
            manageAccounts: "Manage Accounts",
            accountInfo: "Account Info",
            connectedAccounts: "Connected Accounts",
            activeNetwork: "Active Network",
            requestPermissions: "Request Permissions",
            transactionHistory: "Transaction History",
            address: "Address",
            lastTransaction: "Last Transaction",
            noTransactions: "No Transactions",
            viewOnExplorer: "View on Explorer",
            noAccounts: "No Accounts",
            selectAccount: "Select Account",
            addAccount: "Add Account",
            removeAccount: "Remove Account",
            copyAddress: "Copy Address",
            addressCopied: "Address Copied!",
            balance: "Balance",
            network: "Network",
            selectNetwork: "Select Network",
            appInfo: "App Info",
            learnMore: "Learn More",
            getStarted: "Get Started",
            recommendedWallets: "Recommended Wallets",
            manageAccounts: "Manage Accounts",
            accountInfo: "Account Info",
            connectedAccounts: "Connected Accounts",
            activeNetwork: "Active Network",
            requestPermissions: "Request Permissions",
            transactionHistory: "Transaction History",
            address: "Address",
            lastTransaction: "Last Transaction",
            noTransactions: "No Transactions",
            viewOnExplorer: "View on Explorer",
            noAccounts: "No Accounts",
            selectAccount: "Select Account",
            addAccount: "Add Account",
            removeAccount: "Remove Account",
          },
        },
      },
      accountCenter: {
        desktop: {
          enabled: true,
          position: "topRight",
          minimal: true,
        },
        mobile: {
          enabled: true,
          position: "topRight",
          minimal: true,
        },
      },
      notify: {
        desktop: {
          enabled: true,
          transactionHandler: (transaction) => {
            if (transaction.eventCode === "txPool") {
              return {
                type: "success",
                message: "Your transaction is in the mempool",
                autoDismiss: 5000,
              };
            }
          },
          position: "bottomRight",
        },
        mobile: {
          enabled: true,
          transactionHandler: (transaction) => {
            if (transaction.eventCode === "txPool") {
              return {
                type: "success",
                message: "Your transaction is in the mempool",
                autoDismiss: 5000,
              };
            }
          },
          position: "topRight",
        },
      },
    });

    // Create UI elements
    this.createUI();
  }

  createUI() {
    // Create styles for wallet container
    const style = document.createElement("style");
    style.textContent = `
      .wallet-container {
        position: fixed;
        top: 60px;
        left: 20px;
        z-index: 1002;
      }

      @media (max-width: 768px) {
        .wallet-container {
          left: 50%;
          transform: translateX(-50%);
        }
      }
    `;
    document.head.appendChild(style);

    // Create wallet connection button
    const container = document.createElement("div");
    container.className = "wallet-container";

    const connectButton = document.createElement("button");
    connectButton.className = "connect-wallet-btn";
    connectButton.innerHTML = `
      <span class="wallet-icon">🔗</span>
      <span class="wallet-text">Connect Wallet</span>
    `;
    connectButton.style.cssText = `
      background-color: #7A200C;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
      font-family: inherit;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      white-space: nowrap;
    `;

    // Add hover effects
    connectButton.addEventListener("mouseover", () => {
      connectButton.style.backgroundColor = "#8B2314";
      connectButton.style.transform = "translateY(-1px)";
    });

    connectButton.addEventListener("mouseout", () => {
      connectButton.style.backgroundColor = this.isConnected()
        ? "#8B2314"
        : "#7A200C";
      connectButton.style.transform = "translateY(0)";
    });

    connectButton.addEventListener("click", () =>
      this.connectWallet(connectButton)
    );
    container.appendChild(connectButton);
    document.body.appendChild(container);

    // Check if already connected
    if (this.isConnected()) {
      const [primaryWallet] = this.onboard.state.get().wallets;
      const address = primaryWallet.accounts[0].address;
      connectButton.innerHTML = `
        <span class="wallet-icon">👛</span>
        <span class="wallet-address">${address.slice(0, 6)}...${address.slice(
        -4
      )}</span>
      `;
      connectButton.style.backgroundColor = "#8B2314";
    }
  }

  async updateButtonState(button, address) {
    if (!address) {
      button.innerHTML = `
        <span class="wallet-icon">🔗</span>
        <span class="wallet-text">Connect Wallet</span>
      `;
      button.style.backgroundColor = "#7A200C";
      return;
    }

    // Show loading state while resolving identity
    button.innerHTML = `
      <span class="wallet-icon">⏳</span>
      <span class="wallet-text">Resolving identity...</span>
    `;
    button.style.backgroundColor = "#8B2314";

    try {
      // Try to resolve identity
      const identity = await this.identityResolver.resolveIdentity(address);

      if (identity) {
        const displayName = this.identityResolver.formatDisplayName(identity);
        button.innerHTML = `
          <span class="wallet-icon">👛</span>
          <span class="wallet-address">${
            displayName || `${address.slice(0, 6)}...${address.slice(-4)}`
          }</span>
        `;
        button.style.backgroundColor = "#8B2314";
      } else {
        // Fallback to shortened address
        button.innerHTML = `
          <span class="wallet-icon">👛</span>
          <span class="wallet-address">${address.slice(0, 6)}...${address.slice(
          -4
        )}</span>
        `;
        button.style.backgroundColor = "#8B2314";
      }
    } catch (error) {
      console.error("Error resolving identity:", error);
      // Fallback to shortened address on error
      button.innerHTML = `
        <span class="wallet-icon">👛</span>
        <span class="wallet-address">${address.slice(0, 6)}...${address.slice(
        -4
      )}</span>
      `;
      button.style.backgroundColor = "#8B2314";
    }
  }

  async connectWallet(button) {
    try {
      button.disabled = true;
      button.innerHTML = `
        <span class="wallet-icon">⏳</span>
        <span class="wallet-text">Connecting...</span>
      `;

      const wallets = await this.onboard.connectWallet();
      if (wallets && wallets.length > 0) {
        const [primaryWallet] = wallets;
        this.provider = new ethers.providers.Web3Provider(
          primaryWallet.provider
        );

        // Update button with resolved identity
        await this.updateButtonState(button, primaryWallet.accounts[0].address);
        button.disabled = false;
        return this.provider;
      }
      throw new Error("No wallet connected");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      await this.updateButtonState(button);
      button.disabled = false;
      return null;
    }
  }

  async disconnectWallet() {
    try {
      const [primaryWallet] = this.onboard.state.get().wallets;
      if (primaryWallet) {
        await this.onboard.disconnectWallet({ label: primaryWallet.label });

        // Reset the connect button
        const button = document.querySelector(".connect-wallet-btn");
        if (button) {
          await this.updateButtonState(button);
          button.disabled = false;
        }
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }

  isConnected() {
    const wallets = this.onboard.state.get().wallets;
    if (wallets.length > 0) {
      const [primaryWallet] = wallets;
      const button = document.querySelector(".connect-wallet-btn");
      if (button) {
        this.updateButtonState(button, primaryWallet.accounts[0].address);
      }
    }
    return wallets.length > 0;
  }

  getProvider() {
    return this.provider;
  }
}
