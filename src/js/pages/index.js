import '../../styles/index.scss';
import '../../styles/pages/index.scss';
import '../../styles/components/wallet.scss';
import CanvasManager from '../components/canvas-manager';
import { SignatureControls } from '../components/signature-controls.js';
import wallet from '../components/wallet';

export default class Index {
  constructor() {
    window.addEventListener('resize', this.resize.bind(this));
    this.resize();
    this.initGrid();
    this.setupWalletUI();
    const canvasManager = new CanvasManager();
    new SignatureControls(canvasManager);
    // Example: listen for capture complete event (replace with real event)
    // document.addEventListener('captureComplete', (e) => this.onCapture(e.detail));
    // For demo, enable mint after 3s
    setTimeout(() => {
      this.enableMint('https://example.com/metadata.json');
    }, 3000);
  }
  setupWalletUI() {
    // Create wallet UI container
    const walletDiv = document.createElement('div');
    walletDiv.id = 'wallet-ui';
    walletDiv.innerHTML = `
      <button id="wallet-connect">Connect Wallet</button>
      <span id="wallet-status" style="display:none;"></span>
      <span id="wallet-profile" style="display:none;"></span>
    `;
    document.body.appendChild(walletDiv);
    const connectBtn = document.getElementById('wallet-connect');
    const statusSpan = document.getElementById('wallet-status');
    const profileSpan = document.getElementById('wallet-profile');
    connectBtn.onclick = async () => {
      await wallet.connect();
    };
    function updateProfileUI({ ensName, avatar, account }) {
      if (ensName || account) {
        walletDiv.classList.remove('disconnected');
        connectBtn.style.display = 'none';
        statusSpan.style.display = 'none';
        profileSpan.style.display = '';
        profileSpan.innerHTML = `
          ${avatar ? `<img src="${avatar}" class="wallet-avatar" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:6px;">` : ''}
          <span style="vertical-align:middle;font-weight:600;">${ensName ? ensName : account.slice(0,6)+'...'+account.slice(-4)}</span>
          <button id="wallet-disconnect" class="wallet-disconnect-btn">Disconnect</button>
        `;
        // Add disconnect handler
        setTimeout(() => {
          const disconnectBtn = document.getElementById('wallet-disconnect');
          if (disconnectBtn) {
            disconnectBtn.onclick = () => {
              if (window.ethereum && window.ethereum.isMetaMask) {
                // MetaMask does not support programmatic disconnect, so just clear UI
                wallet.account = null;
                wallet.ensName = null;
                wallet.avatar = null;
                wallet._notify();
              }
            };
          }
        }, 0);
      } else {
        connectBtn.style.display = '';
        statusSpan.style.display = 'none';
        profileSpan.style.display = 'none';
        walletDiv.classList.add('disconnected');
      }
    }
    wallet.onProfileChange(updateProfileUI);
    wallet.onChange(account => {
      if (!account) updateProfileUI({account:null});
    });

  }
  // enableMint removed: wallet-mint button no longer exists
  // If needed in the future, add minting logic elsewhere.
  
  initGrid() {
    document.addEventListener('keydown', (e) => {
      if(e.shiftKey && e.key === 'G') {
        document.getElementById('grid').classList.toggle('show')
      }
    })
  }
  resize() {
    document.documentElement.style.setProperty('--rvw', `${document.documentElement.clientWidth / 100}px`);
  }
}
window.addEventListener('load', () => {
  new Index();
});