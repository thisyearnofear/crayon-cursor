import { SignaturePreviewModal } from './signature-preview-modal.js';

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
    container.innerHTML = `
      <div class="timer">00:10</div>
      <div class="hint">Press 'R' to start/stop recording</div>
      <button class="start-btn">Start Recording</button>
      <button class="save-btn" disabled>Save Signature</button>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .signature-controls {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .signature-controls .timer {
        margin-bottom: 5px;
        color: #7A200C;
      }
      .signature-controls .hint {
        font-size: 12px;
        text-align: center;
        margin-bottom: 10px;
        color: #666;
        font-size: 24px;
        text-align: center;
        font-family: monospace;
      }
      .signature-controls button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
      }
      .signature-controls .start-btn {
        background: #FC0E49;
        color: white;
      }
      .signature-controls .start-btn:hover {
        background: #e00940;
      }
      .signature-controls .save-btn {
        background: #7A200C;
        color: white;
      }
      .signature-controls .save-btn:hover {
        background: #641a0a;
      }
      .signature-controls button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);

    // Add to DOM
    document.body.appendChild(container);
    
    // Store references
    this.container = container;
    this.timerEl = container.querySelector('.timer');
    this.startBtn = container.querySelector('.start-btn');
    this.saveBtn = container.querySelector('.save-btn');
  }

  attachEventListeners() {
    this.startBtn.addEventListener('click', () => {
      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    });

    this.saveBtn.addEventListener('click', async () => {
      try {
        this.saveBtn.disabled = true;
        this.saveBtn.textContent = 'Preparing...';
        
        // Get the signature image
        const imageDataUrl = this.canvasManager.captureCanvas();
        if (!imageDataUrl) {
          throw new Error('Failed to capture signature');
        }

        // Show preview modal
        this.previewModal.show(imageDataUrl, async (finalImageUrl) => {
          try {
            this.saveBtn.textContent = 'Saving to Grove...';
            const result = await this.canvasManager.signatureCapture.saveToGrove(this.canvasManager, finalImageUrl);
            console.log('Signature saved:', result);
            alert('Signature uploaded!\n\nDirect URL:\n' + result.imageUrl + '\n\nLens URI:\n' + result.uri);
          } catch (error) {
            console.error('Failed to save to Grove:', error);
            alert('Failed to save signature to Grove. Please try again.');
          } finally {
            this.saveBtn.textContent = 'Save Signature';
            this.saveBtn.disabled = true;
          }
        });

        // Re-enable save button while modal is shown
        this.saveBtn.textContent = 'Save Signature';
        this.saveBtn.disabled = false;
      } catch (error) {
        console.error('Failed to save signature:', error);
        alert('Failed to save signature. Please try again.');
        this.saveBtn.textContent = 'Save Signature';
        this.saveBtn.disabled = false;
      }
    });
  }

  startRecording() {
    this.isRecording = true;
    this.startBtn.textContent = 'Stop Recording';
    this.saveBtn.disabled = true;
    
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
    this.startBtn.textContent = 'Start Recording';
    this.saveBtn.disabled = false;
    
    clearInterval(this.timerInterval);
    this.canvasManager.signatureCapture.stopRecording();
  }

  updateTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerEl.textContent = mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
  }
}
