// signature-controls.js
// Controls for signature recording and saving

import { SignatureModal } from "./signature-modal.js";
import wallet from "./wallet.js";

export class SignatureControls {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.isRecording = false;
    this.timerInterval = null;

    // Create modals
    this.signatureModal = new SignatureModal({
      title: "Your Signature",
      onClose: () => {
        // Re-enable buttons when modal is closed
        if (this.signBtn) {
          this.signBtn.disabled = false;
        }
      },
    });

    this.mobileSignatureModal = new SignatureModal({
      title: "Sign on Mobile",
      isMobile: true,
      width: "380px",
      onClose: () => {},
    });

    this.createUI();
    this.attachEventListeners();

    // Add keyboard control
    document.addEventListener("keydown", (e) => {
      if (e && e.key && e.key.toLowerCase() === "r") {
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
    const container = document.createElement("div");
    container.className = "signature-controls";

    // If mobile, show a 'Sign on Mobile' button
    if (window.innerWidth <= 600) {
      const mobileBtn = document.createElement("button");
      mobileBtn.textContent = "Sign on Mobile";
      mobileBtn.className = "signature-button";
      mobileBtn.style.marginBottom = "12px";
      mobileBtn.onclick = () => {
        this.mobileSignatureModal.show();
      };
      container.appendChild(mobileBtn);
    }

    // Create timer, hint, and buttons
    const timerEl = document.createElement("div");
    timerEl.className = "timer";
    timerEl.textContent = "00:10";

    const hintEl = document.createElement("div");
    hintEl.className = "hint";
    hintEl.textContent = "Press 'R' to start/stop recording";

    const startBtn = document.createElement("button");
    startBtn.className = "start-btn";
    startBtn.textContent = "Start";

    const signBtn = document.createElement("button");
    signBtn.className = "sign-btn";
    signBtn.textContent = "Sign";
    signBtn.disabled = true;

    // Add elements to container
    container.appendChild(timerEl);
    container.appendChild(hintEl);
    container.appendChild(startBtn);
    container.appendChild(signBtn);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .signature-controls {
        position: static;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 12px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
        padding: 13px 22px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 16px;
        z-index: 10;
        font-family: inherit;
        font-size: 13px;
        transition: box-shadow 0.2s;
        width: 100%;
        min-width: 260px;
        max-width: 420px;
      }
      .signature-controls .timer {
        margin-bottom: 5px;
        color: #7A200C;
      }
      .signature-controls .hint {
        font-size: 10px;
        text-align: center;
        margin-bottom: 7px;
        color: #666;
        font-family: monospace;
      }
      .signature-controls button {
        padding: 7px 13px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 11px;
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
    const anchor = document.getElementById("signature-controls-anchor");
    if (anchor) {
      anchor.appendChild(container);
    } else {
      document.body.appendChild(container);
    }

    // Store references
    this.container = container;
    this.timerEl = timerEl;
    this.startBtn = startBtn;
    this.signBtn = signBtn;
  }

  attachEventListeners() {
    this.startBtn.addEventListener("click", () => {
      if (window.innerWidth <= 600) {
        // On mobile, launch the modal instead of recording
        this.mobileSignatureModal.show();
        return;
      }

      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    });

    this.signBtn.addEventListener("click", async () => {
      try {
        this.signBtn.disabled = true;
        this.signBtn.textContent = "Signing";

        // Get the signature image
        const imageDataUrl = this.canvasManager.captureCanvas();
        if (!imageDataUrl) {
          throw new Error("Failed to capture signature");
        }

        // Show signature modal
        this.signatureModal.show(imageDataUrl);

        // Re-enable save button while modal is shown
        this.signBtn.textContent = "Sign";
        this.signBtn.disabled = false;
      } catch (error) {
        console.error("Failed to capture signature:", error);
        alert("Failed to capture signature. Please try again.");
        this.signBtn.textContent = "Sign";
        this.signBtn.disabled = false;
      }
    });
  }

  startRecording() {
    this.isRecording = true;
    this.startBtn.textContent = "Stop";
    this.signBtn.disabled = true;
    this.canvasManager.setTrailFadePaused(true);
    this.canvasManager.signatureCapture.startRecording();

    // Start timer
    let timeLeft = 10;
    this.updateTimer(timeLeft);
    this.timerInterval = setInterval(() => {
      timeLeft = Math.floor(
        this.canvasManager.signatureCapture.getRemainingTime() / 1000
      );
      this.updateTimer(timeLeft);
      if (timeLeft <= 0) {
        this.stopRecording();
      }
    }, 1000);
  }

  stopRecording() {
    this.isRecording = false;
    this.startBtn.textContent = "Start";
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
    this.timerEl.textContent =
      mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");
  }
}
