import { SignaturePreviewModal } from './signature-preview-modal.js';
import { MobileSignatureModal } from './mobile-signature-modal.js';
import wallet from './wallet';

export class SignatureControls {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.isRecording = false;
    this.timerInterval = null;
    this.previewModal = new SignaturePreviewModal();
    
    this.createUI();
    this.attachEventListeners();
    
    // Add keyboard control
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'r') {
        if (!this.isRecording) {
          this.startRecording();
        } else {
          this.stopRecording();
        }
      }
    });
  }

  createUI() {
    // Create container
    const container = document.createElement('div');
    container.className = 'signature-controls';

    // If mobile, show a 'Sign on Mobile' button
    if (window.innerWidth <= 600) {
      const mobileBtn = document.createElement('button');
      mobileBtn.textContent = 'Sign on Mobile';
      mobileBtn.className = 'signature-button';
      mobileBtn.style.marginBottom = '12px';
      mobileBtn.onclick = () => {
        new MobileSignatureModal({
          onSave: (dataUrl) => {
            this.previewModal.show(
              dataUrl,
              async (finalImageUrl, uriCallback) => {
                try {
                  this.signBtn.textContent = 'Signing';
                  const result = await this.canvasManager.signatureCapture.saveToGrove(this.canvasManager, finalImageUrl);
                  // Only call the callback with the URI (if provided)
                  if (uriCallback) uriCallback(result.uri);
                } catch (error) {
                  alert('Failed to save signature. Please try again.');
                } finally {
                  this.signBtn.textContent = 'Sign';
                  this.signBtn.disabled = true;
                }
              },
              async (mintImageUrl) => {
                try {
                  await wallet.mint(mintImageUrl);
                  alert('Mint transaction sent!');
                } catch (err) {
                  alert('Minting failed: ' + (err && err.message ? err.message : err));
                }
              }
            );
          },
          onCancel: () => {}
        });
      };
      container.appendChild(mobileBtn);
    }
    container.innerHTML = `
      <div class="timer">00:10</div>
      <div class="hint">Press 'R' to start/stop recording</div>
      <button class="start-btn">Start</button>
      <button class="sign-btn" disabled>Sign</button>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .signature-controls {
        position: static;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 12rem;
        box-shadow: 0 2rem 12rem 0 rgba(0,0,0,0.08);
        padding: 13rem 22rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 16rem;
        z-index: 10;
        font-family: inherit;
        font-size: 13rem;
        transition: box-shadow 0.2s;
        width: 100%;
        min-width: 260rem;
        max-width: 420rem;
      }
      .signature-controls .timer {
        margin-bottom: 5px;
        color: #7A200C;
      }
      .signature-controls .hint {
        font-size: 10rem;
        text-align: center;
        margin-bottom: 7rem;
        color: #666;
        font-family: monospace;
      }
      .signature-controls button {
        padding: 7rem 13rem;
        border: none;
        border-radius: 6rem;
        cursor: pointer;
        font-weight: 500;
        font-size: 11rem;
        transition: background-color 0.2s;
      }
      .signature-controls .start-btn {
        background: #FC0E49;
        color: white;
      }
      .signature-controls .start-btn:hover {
        background: #e00940;
      }
      .signature-controls .sign-btn {
        background: #7A200C;
        color: white;
      }
      .signature-controls .sign-btn:hover {
        background: #641a0a;
      }
      .signature-controls button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);

    // Add to DOM
    const anchor = document.getElementById('signature-controls-anchor');
    if (anchor) {
      anchor.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
    // Store references
    this.container = container;
    this.timerEl = container.querySelector('.timer');
    this.startBtn = container.querySelector('.start-btn');
    this.signBtn = container.querySelector('.sign-btn');
  }

  attachEventListeners() {
    this.startBtn.addEventListener('click', () => {
      if (window.innerWidth <= 600) {
        // On mobile, launch the modal instead of recording
        new MobileSignatureModal({
          onSave: (dataUrl) => {
            this.previewModal.show(
              dataUrl,
              async (finalImageUrl) => {
                try {
                  this.signBtn.textContent = 'Signing';
                  const result = await this.canvasManager.signatureCapture.saveToGrove(this.canvasManager, finalImageUrl);
                  this.previewModal.showResult({
                    imageUrl: result.imageUrl,
                    uri: result.uri,
                    imageDataUrl: finalImageUrl
                  });
                } catch (error) {
                  alert('Failed to save signature. Please try again.');
                } finally {
                  this.signBtn.textContent = 'Sign';
                  this.signBtn.disabled = true;
                }
              },
              async (mintImageUrl) => {
                try {
                  await wallet.mint(mintImageUrl);
                  alert('Mint transaction sent!');
                } catch (err) {
                  alert('Minting failed: ' + (err && err.message ? err.message : err));
                }
              }
            );
          },
          onCancel: () => {}
        });
        return;
      }
      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    });

    this.signBtn.addEventListener('click', async () => {
      try {
        this.signBtn.disabled = true;
        this.signBtn.textContent = 'Signing';
        
        // Get the signature image
        const imageDataUrl = this.canvasManager.captureCanvas();
        if (!imageDataUrl) {
          throw new Error('Failed to capture signature');
        }

        // Show preview modal
        this.previewModal.show(
          imageDataUrl,
          async (finalImageUrl, uriCallback) => {
            try {
              this.signBtn.textContent = 'Signing';
              const result = await this.canvasManager.signatureCapture.saveToGrove(this.canvasManager, finalImageUrl);
              // Only call the callback with the URI (if provided)
              if (uriCallback) uriCallback(result.uri);
            } catch (error) {
              console.error('Failed to save to Grove:', error);
              alert('Failed to save signature. Please try again.');
            } finally {
              this.signBtn.textContent = 'Sign';
              this.signBtn.disabled = true;
            }
          },
          async (mintImageUrl) => {
            try {
              await wallet.mint(mintImageUrl);
              alert('Mint transaction sent!');
            } catch (err) {
              alert('Minting failed: ' + (err && err.message ? err.message : err));
            }
          }
        );

        // Re-enable save button while modal is shown
        this.signBtn.textContent = 'Sign';
        this.signBtn.disabled = false;
      } catch (error) {
        console.error('Failed to save signature:', error);
        alert('Failed to save signature. Please try again.');
        this.signBtn.textContent = 'Sign';
        this.signBtn.disabled = false;
      }
    });
  }

  startRecording() {
    this.isRecording = true;
    this.startBtn.textContent = 'Stop';
    this.signBtn.disabled = true;
    this.canvasManager.setTrailFadePaused(true);
    this.canvasManager.signatureCapture.startRecording();
    // Start timer
    let timeLeft = 10;
    this.updateTimer(timeLeft);
    this.timerInterval = setInterval(() => {
      timeLeft = Math.floor(this.canvasManager.signatureCapture.getRemainingTime() / 1000);
      this.updateTimer(timeLeft);
      if (timeLeft <= 0) {
        this.stopRecording();
      }
    }, 1000);
  }

  stopRecording() {
    this.isRecording = false;
    this.startBtn.textContent = 'Start';
    this.signBtn.disabled = false;
    clearInterval(this.timerInterval);
    this.canvasManager.signatureCapture.stopRecording();
    // Start grace period: keep trail visible for 10s
    let grace = 0;
    this.updateTimer(grace);
    this.canvasManager.setTrailFadePaused(true);
    this.timerInterval = setInterval(() => {
      grace++;
      this.updateTimer(grace);
      if (grace >= 10) {
        clearInterval(this.timerInterval);
        this.canvasManager.setTrailFadePaused(false);
        this.updateTimer(10);
      }
    }, 1000);
  }

  updateTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerEl.textContent = mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
  }
}
