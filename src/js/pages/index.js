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
      <span id="wallet-status"></span>
      <span id="wallet-profile" style="display:none;"></span>
      <button id="wallet-mint" disabled>Mint</button>
    `;
    document.body.appendChild(walletDiv);
    const connectBtn = document.getElementById('wallet-connect');
    const statusSpan = document.getElementById('wallet-status');
    const profileSpan = document.getElementById('wallet-profile');
    connectBtn.onclick = async () => {
      await wallet.connect();
    };
    function updateProfileUI({ ensName, avatar, account }) {
      if (account) {
        connectBtn.style.display = 'none';
        statusSpan.style.display = 'none';
        profileSpan.style.display = '';
        profileSpan.innerHTML = `
          ${avatar ? `<img src="${avatar}" alt="avatar" style="width:28rem;height:28rem;border-radius:50%;vertical-align:middle;margin-right:8rem;">` : ''}
          <span style="vertical-align:middle;font-weight:600;">${ensName ? ensName : account.slice(0,6)+'...'+account.slice(-4)}</span>
        `;
      } else {
        connectBtn.style.display = '';
        statusSpan.style.display = '';
        profileSpan.style.display = 'none';
        statusSpan.textContent = 'Not connected';
      }
    }
    wallet.onProfileChange(updateProfileUI);
    wallet.onChange(account => {
      if (!account) updateProfileUI({account:null});
    });
    document.getElementById('wallet-mint').onclick = async () => {
      if (this._mintDataUrl) {
        await wallet.mint(this._mintDataUrl);
      }
    };
  }
  enableMint(metadataUrl) {
    this._mintDataUrl = metadataUrl;
    document.getElementById('wallet-mint').disabled = false;
  }
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