import { SignaturePreviewModal } from "../signature-preview-modal.js";
import { WalletManager } from "../../wallet-manager.js";

export class BaseSignatureControls {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.isRecording = false;
    this.isPostRecording = false;
    this.timerInterval = null;
    this.previewModal = new SignaturePreviewModal();
    this.walletManager = new WalletManager();
    this.countdown = 10;
    this.postRecordingDuration = 10000; // 10 seconds
  }

  createTooltip(text) {
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 1003;
      white-space: nowrap;
      transform: translateX(-50%);
    `;
    tooltip.textContent = text;
    return tooltip;
  }

  createTimerDisplay() {
    const timerContainer = document.createElement("div");
    timerContainer.className = "timer-container";
    timerContainer.style.cssText = `
      position: relative;
      display: inline-block;
    `;

    const timerDisplay = document.createElement("div");
    timerDisplay.className = "timer-display";
    timerDisplay.style.cssText = `
      font-size: 24px;
      font-weight: bold;
      color: #7A200C;
      text-align: center;
      font-family: monospace;
      margin-bottom: 4px;
      background: rgba(122, 32, 12, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
      cursor: help;
    `;
    timerDisplay.textContent = "00:10";

    const tooltip = this.createTooltip(
      "Time remaining to complete your signature"
    );
    timerContainer.appendChild(timerDisplay);
    timerContainer.appendChild(tooltip);

    // Add hover events
    timerDisplay.addEventListener("mouseenter", () => {
      tooltip.style.opacity = "1";
    });
    timerDisplay.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    return timerContainer;
  }

  createStatusText() {
    const statusContainer = document.createElement("div");
    statusContainer.className = "status-container";
    statusContainer.style.cssText = `
      position: relative;
      display: inline-block;
    `;

    const statusText = document.createElement("div");
    statusText.className = "status-text";
    statusText.style.cssText = `
      font-size: 12px;
      color: #666;
      text-align: center;
      margin-bottom: 4px;
      line-height: 1.4;
      cursor: help;
    `;
    statusText.textContent = "Press 'R' or click Record to begin";

    const tooltip = this.createTooltip("Current status and available actions");
    statusContainer.appendChild(statusText);
    statusContainer.appendChild(tooltip);

    // Add hover events
    statusText.addEventListener("mouseenter", () => {
      tooltip.style.opacity = "1";
    });
    statusText.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    return statusContainer;
  }

  createRecordButton() {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    buttonContainer.style.cssText = `
      position: relative;
      display: inline-block;
    `;

    const recordButton = document.createElement("button");
    recordButton.className = "record-button";
    recordButton.style.cssText = `
      background-color: #7A200C;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
      font-size: 14px;
      min-width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      position: relative;
    `;
    recordButton.innerHTML = `
      <span class="record-icon">●</span>
      <span class="record-text">Record</span>
    `;

    const tooltip = this.createTooltip("Click or press 'R' to start recording");
    buttonContainer.appendChild(recordButton);
    buttonContainer.appendChild(tooltip);

    // Add hover events
    recordButton.addEventListener("mouseenter", (e) => {
      const rect = recordButton.getBoundingClientRect();
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.opacity = "1";
    });
    recordButton.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    // Add touch events for mobile
    recordButton.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const rect = recordButton.getBoundingClientRect();
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.opacity = "1";
    });
    recordButton.addEventListener("touchend", () => {
      tooltip.style.opacity = "0";
    });

    // Store the actual button reference
    this.recordButton = recordButton;
    return buttonContainer;
  }

  createSaveButton() {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    buttonContainer.style.cssText = `
      position: relative;
      display: inline-block;
    `;

    const saveButton = document.createElement("button");
    saveButton.className = "save-button";
    saveButton.style.cssText = `
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
      font-size: 14px;
      min-width: 100px;
      display: none;
      align-items: center;
      justify-content: center;
      gap: 6px;
      position: relative;
    `;
    saveButton.innerHTML = `
      <span class="save-icon">💾</span>
      <span class="save-text">Save</span>
    `;

    const tooltip = this.createTooltip("Save your signature to the blockchain");
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(tooltip);

    // Add hover events
    saveButton.addEventListener("mouseenter", (e) => {
      const rect = saveButton.getBoundingClientRect();
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.opacity = "1";
    });
    saveButton.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    // Add touch events for mobile
    saveButton.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const rect = saveButton.getBoundingClientRect();
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.opacity = "1";
    });
    saveButton.addEventListener("touchend", () => {
      tooltip.style.opacity = "0";
    });

    // Store the actual button reference
    this.saveButton = saveButton;
    return buttonContainer;
  }

  updateTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString =
      mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");
    this.timerDisplay.textContent = timeString;
  }

  startRecording() {
    this.isRecording = true;
    this.isPostRecording = false;

    // Update UI immediately
    this.recordButton.innerHTML = `
      <span class="record-icon" style="color: #ff4444">●</span>
      <span class="record-text">Stop</span>
    `;
    this.saveButton.style.display = "none";
    this.statusText.textContent = "Recording in progress...";

    // Reset and start countdown
    this.countdown = 10;
    this.updateTimer(this.countdown);

    // Start recording
    this.canvasManager.signatureCapture.startRecording();

    // Start countdown timer
    this.timerInterval = setInterval(() => {
      this.countdown--;
      this.updateTimer(this.countdown);

      if (this.countdown <= 0) {
        this.stopRecording();
      }
    }, 1000);
  }

  stopRecording() {
    // First stop the recording
    this.canvasManager.signatureCapture.stopRecording();

    // Then update the UI state
    this.isRecording = false;
    this.isPostRecording = true;

    // Update UI immediately
    this.recordButton.innerHTML = `
      <span class="record-icon">❌</span>
      <span class="record-text">Cancel</span>
    `;
    this.saveButton.style.display = "flex";
    this.statusText.textContent = "Save or cancel within 10 seconds";

    // Stop recording and clear timer
    clearInterval(this.timerInterval);

    // Start post-recording countdown immediately
    this.countdown = 0;
    this.updateTimer(this.countdown);

    // Start the countup timer
    this.timerInterval = setInterval(() => {
      this.countdown++;
      this.updateTimer(this.countdown);

      if (this.countdown >= 10) {
        this.cancelPostRecording();
      }
    }, 1000);
  }

  cancelPostRecording() {
    this.isPostRecording = false;
    this.recordButton.innerHTML = `
      <span class="record-icon">●</span>
      <span class="record-text">Record</span>
    `;
    this.saveButton.style.display = "none";
    this.statusText.textContent = "Press 'R' or click Record to begin";
    clearInterval(this.timerInterval);
    this.canvasManager.cancelFreeze();
  }

  async saveSignature() {
    try {
      if (!this.walletManager.isConnected()) {
        alert("Please connect your wallet first");
        return;
      }

      // Disable the save button and show loading state
      this.saveButton.disabled = true;
      this.saveButton.innerHTML = `
        <span class="save-icon">⏳</span>
        <span class="save-text">Preparing...</span>
      `;

      // Capture the canvas
      const imageDataUrl = this.canvasManager.captureCanvas();
      if (!imageDataUrl) {
        throw new Error("Failed to capture signature");
      }

      // Show the preview modal
      this.previewModal.show(imageDataUrl, async (finalImageUrl) => {
        try {
          // Update button state while saving
          this.saveButton.innerHTML = `
            <span class="save-icon">⏳</span>
            <span class="save-text">Saving to Grove...</span>
          `;

          // Save to Grove
          const result = await this.canvasManager.signatureCapture.saveToGrove(
            this.canvasManager,
            finalImageUrl
          );

          console.log("Signature saved:", result);
          alert(
            "Signature uploaded!\n\nDirect URL:\n" +
              result.imageUrl +
              "\n\nLens URI:\n" +
              result.uri
          );
        } catch (error) {
          console.error("Failed to save to Grove:", error);
          alert("Failed to save signature to Grove. Please try again.");
        } finally {
          // Reset button state
          this.saveButton.innerHTML = `
            <span class="save-icon">💾</span>
            <span class="save-text">Save</span>
          `;
          this.saveButton.disabled = false;
          this.cancelPostRecording();
        }
      });
    } catch (error) {
      console.error("Failed to save signature:", error);
      alert("Failed to save signature. Please try again.");
      // Reset button state
      this.saveButton.innerHTML = `
        <span class="save-icon">💾</span>
        <span class="save-text">Save</span>
      `;
      this.saveButton.disabled = false;
    }
  }

  attachEventListeners() {
    this.recordButton.addEventListener("click", () => {
      if (!this.isRecording && !this.isPostRecording) {
        this.startRecording();
      } else if (this.isRecording) {
        this.stopRecording();
      } else if (this.isPostRecording) {
        this.cancelPostRecording();
      }
    });

    this.saveButton.addEventListener("click", () => this.saveSignature());

    // Add keyboard control
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "r") {
        if (!this.isRecording && !this.isPostRecording) {
          this.startRecording();
        } else if (this.isRecording) {
          this.stopRecording();
        } else if (this.isPostRecording) {
          this.cancelPostRecording();
        }
      }
    });
  }
}
