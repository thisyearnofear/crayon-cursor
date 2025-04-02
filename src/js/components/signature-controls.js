import { SignaturePreviewModal } from "./signature-preview-modal.js";
import { WalletManager } from "../wallet-manager.js";
import { ModeToggle } from "./mode-toggle.js";

export class SignatureControls {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.isRecording = false;
    this.isPostRecording = false;
    this.timerInterval = null;
    this.previewModal = new SignaturePreviewModal();
    this.walletManager = new WalletManager();
    this.modeToggle = new ModeToggle(canvasManager);
    this.countdown = 10;
    this.postRecordingDuration = 10000; // 10 seconds

    this.createUI();
    this.attachEventListeners();

    // Add keyboard control
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "r") {
        if (!this.isRecording && !this.isPostRecording) {
          this.startRecording();
        } else if (this.isPostRecording) {
          this.cancelPostRecording();
        }
      }
    });
  }

  createUI() {
    // Create a wrapper container for the entire app
    const appWrapper = document.createElement("div");
    appWrapper.className = "app-wrapper";
    appWrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
      position: relative;
    `;

    // Create main content area
    const mainContent = document.createElement("div");
    mainContent.className = "main-content";
    mainContent.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      padding-bottom: 0;
    `;

    // Create controls container
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "controls-container";
    controlsContainer.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 200px;
      max-width: 90vw;
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    `;

    // Timer display
    this.timerDisplay = document.createElement("div");
    this.timerDisplay.className = "timer-display";
    this.timerDisplay.style.cssText = `
      font-size: 24px;
      font-weight: bold;
      color: #7A200C;
      text-align: center;
      font-family: monospace;
      margin-bottom: 4px;
      background: rgba(122, 32, 12, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    `;
    this.timerDisplay.textContent = "00:10";
    controlsContainer.appendChild(this.timerDisplay);

    // Status text
    this.statusText = document.createElement("div");
    this.statusText.className = "status-text";
    this.statusText.style.cssText = `
      font-size: 12px;
      color: #666;
      text-align: center;
      margin-bottom: 4px;
      line-height: 1.4;
    `;
    this.statusText.textContent = "Press 'R' or click Start to begin recording";
    controlsContainer.appendChild(this.statusText);

    // Button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    `;

    // Start/Stop Recording button
    this.recordButton = document.createElement("button");
    this.recordButton.className = "record-button";
    this.recordButton.style.cssText = `
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
    `;
    this.recordButton.innerHTML = `
      <span class="record-icon">●</span>
      <span class="record-text">Start Recording</span>
    `;
    this.recordButton.addEventListener("click", () => this.toggleRecording());
    buttonContainer.appendChild(this.recordButton);

    // Save Signature button
    this.saveButton = document.createElement("button");
    this.saveButton.className = "save-button";
    this.saveButton.style.cssText = `
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
    `;
    this.saveButton.innerHTML = `
      <span class="save-icon">💾</span>
      <span class="save-text">Save Signature</span>
    `;
    this.saveButton.addEventListener("click", () => this.saveSignature());
    buttonContainer.appendChild(this.saveButton);

    controlsContainer.appendChild(buttonContainer);
    mainContent.appendChild(controlsContainer);

    // Create bottom bar for mobile
    const bottomBar = document.createElement("div");
    bottomBar.className = "bottom-bar";
    bottomBar.style.cssText = `
      display: none;
    `;

    // Add mobile timer and buttons to bottom bar
    const mobileTimer = this.timerDisplay.cloneNode(true);
    mobileTimer.style.cssText = `
      font-size: 16px;
      padding: 2px 6px;
      margin: 0;
      background: rgba(122, 32, 12, 0.1);
      border-radius: 4px;
      font-family: monospace;
      font-weight: bold;
      color: #7A200C;
    `;
    bottomBar.appendChild(mobileTimer);

    // Create mobile buttons with proper event listeners
    const mobileButtonContainer = document.createElement("div");
    mobileButtonContainer.className = "button-container";
    mobileButtonContainer.style.cssText = `
      margin: 0;
      padding: 0;
      display: flex;
      gap: 8px;
      justify-content: center;
    `;

    // Create mobile record button
    const mobileRecordButton = document.createElement("button");
    mobileRecordButton.className = "record-button";
    mobileRecordButton.style.cssText = `
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
      height: 40px;
    `;
    mobileRecordButton.innerHTML = `
      <span class="record-icon">●</span>
      <span class="record-text">Record</span>
    `;
    mobileRecordButton.addEventListener("click", () => this.toggleRecording());
    mobileButtonContainer.appendChild(mobileRecordButton);

    // Create mobile save button (initially hidden)
    const mobileSaveButton = document.createElement("button");
    mobileSaveButton.className = "save-button";
    mobileSaveButton.style.cssText = `
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
      height: 40px;
    `;
    mobileSaveButton.innerHTML = `
      <span class="save-icon">💾</span>
      <span class="save-text">Save</span>
    `;
    mobileSaveButton.addEventListener("click", () => this.saveSignature());
    mobileButtonContainer.appendChild(mobileSaveButton);

    bottomBar.appendChild(mobileButtonContainer);

    // Store references for mobile controls
    this.mobileRecordButton = mobileRecordButton;
    this.mobileSaveButton = mobileSaveButton;
    this.mobileTimer = mobileTimer;

    // Update the updateTimer method to handle mobile buttons
    const originalUpdateTimer = this.updateTimer;
    this.updateTimer = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const timeString =
        mins.toString().padStart(2, "0") +
        ":" +
        secs.toString().padStart(2, "0");
      this.timerDisplay.textContent = timeString;
      if (this.mobileTimer) {
        this.mobileTimer.textContent = timeString;
      }
    };

    // Update the startRecording method to handle mobile buttons
    const originalStartRecording = this.startRecording;
    this.startRecording = () => {
      this.isRecording = true;
      this.isPostRecording = false;
      this.recordButton.innerHTML = `
        <span class="record-icon" style="color: #ff4444">●</span>
        <span class="record-text">Stop</span>
      `;
      this.saveButton.style.display = "none";
      this.statusText.textContent = "Recording in progress...";
      this.countdown = 10;

      this.canvasManager.signatureCapture.startRecording();
      this.updateTimer(this.countdown);

      this.timerInterval = setInterval(() => {
        this.countdown--;
        this.updateTimer(this.countdown);

        if (this.countdown <= 0) {
          this.stopRecording();
        }
      }, 1000);

      if (this.mobileRecordButton) {
        this.mobileRecordButton.innerHTML = `
          <span class="record-icon" style="color: #ff4444">●</span>
          <span class="record-text">Stop</span>
        `;
      }
      if (this.mobileSaveButton) {
        this.mobileSaveButton.style.display = "none";
      }
    };

    // Update the stopRecording method to handle mobile buttons
    const originalStopRecording = this.stopRecording;
    this.stopRecording = () => {
      this.isRecording = false;
      this.isPostRecording = true;
      this.recordButton.innerHTML = `
        <span class="record-icon">❌</span>
        <span class="record-text">Cancel</span>
      `;
      this.saveButton.style.display = "flex";
      this.statusText.textContent = "Save or cancel within 10 seconds";
      this.container.classList.add("post-recording");

      clearInterval(this.timerInterval);
      this.canvasManager.signatureCapture.stopRecording();

      // Start post-recording countdown
      this.countdown = 0;
      this.updateTimer(this.countdown);

      this.timerInterval = setInterval(() => {
        this.countdown++;
        this.updateTimer(this.countdown);

        if (this.countdown >= 10) {
          this.cancelPostRecording();
        }
      }, 1000);

      if (this.mobileRecordButton) {
        this.mobileRecordButton.innerHTML = `
          <span class="record-icon">❌</span>
          <span class="record-text">Cancel</span>
        `;
      }
      if (this.mobileSaveButton) {
        this.mobileSaveButton.style.display = "flex";
      }
    };

    // Update the cancelPostRecording method to handle mobile buttons
    const originalCancelPostRecording = this.cancelPostRecording;
    this.cancelPostRecording = () => {
      this.isPostRecording = false;
      this.recordButton.innerHTML = `
        <span class="record-icon">●</span>
        <span class="record-text">Record</span>
      `;
      this.saveButton.style.display = "none";
      this.statusText.textContent = "Press 'R' or click Record to begin";
      this.container.classList.remove("post-recording");
      clearInterval(this.timerInterval);
      this.canvasManager.cancelFreeze();

      if (this.mobileRecordButton) {
        this.mobileRecordButton.innerHTML = `
          <span class="record-icon">●</span>
          <span class="record-text">Record</span>
        `;
      }
      if (this.mobileSaveButton) {
        this.mobileSaveButton.style.display = "none";
      }
    };

    // Add responsive styles
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 768px) {
        body {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 0;
        }

        .app-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: relative;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 20px;
          padding-bottom: 48px;
        }

        .controls-container {
          display: none !important;
          visibility: hidden;
          opacity: 0;
          pointer-events: none;
        }

        .bottom-bar {
          display: flex !important;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.95);
          border-top: 1px solid rgba(122, 32, 12, 0.1);
          box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.08);
          position: absolute;
          top: -200px;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 64px;
        }

        .bottom-bar .button-container {
          display: flex;
          gap: 12px;
          margin: 0;
          padding: 0;
        }

        .bottom-bar button {
          padding: 8px 16px;
          font-size: 14px;
          min-width: 100px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 4px;
          font-weight: bold;
          transition: all 0.2s;
        }

        .bottom-bar button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .bottom-bar button:active {
          transform: translateY(0);
        }

        .wallet-container {
          position: static;
          order: 1;
          width: 100%;
          margin: 10px 0;
          text-align: center;
          display: flex;
          justify-content: center;
        }
        
        .connect-wallet-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 140px;
          height: 36px;
          font-size: 13px;
          padding: 6px 12px;
        }

        #canvas-container {
          order: 3;
          width: 100%;
          display: flex;
          justify-content: center;
          flex: 1;
          min-height: 0;
        }

        canvas {
          max-width: 100%;
          height: auto;
        }

        #hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          padding-bottom: 48px;
        }

        #hero-content {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Assemble the layout
    appWrapper.appendChild(mainContent);
    appWrapper.appendChild(bottomBar);
    document.body.appendChild(appWrapper);

    // Store references
    this.container = controlsContainer;
    this.bottomBar = bottomBar;
  }

  attachEventListeners() {
    this.recordButton.addEventListener("click", () => {
      if (!this.isRecording && !this.isPostRecording) {
        this.startRecording();
      } else if (this.isPostRecording) {
        this.cancelPostRecording();
      }
    });

    this.saveButton.addEventListener("click", async () => {
      try {
        // Check if wallet is connected
        if (!this.walletManager.isConnected()) {
          alert("Please connect your wallet first");
          return;
        }

        this.saveButton.disabled = true;
        this.saveButton.textContent = "Preparing...";

        // Get the signature image
        const imageDataUrl = this.canvasManager.captureCanvas();
        if (!imageDataUrl) {
          throw new Error("Failed to capture signature");
        }

        // Show preview modal
        this.previewModal.show(imageDataUrl, async (finalImageUrl) => {
          try {
            this.saveButton.textContent = "Saving to Grove...";
            const result =
              await this.canvasManager.signatureCapture.saveToGrove(
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
            this.saveButton.textContent = "Save Signature";
            this.saveButton.disabled = true;
            this.cancelPostRecording();
          }
        });

        // Re-enable save button while modal is shown
        this.saveButton.textContent = "Save Signature";
        this.saveButton.disabled = false;
      } catch (error) {
        console.error("Failed to save signature:", error);
        alert("Failed to save signature. Please try again.");
        this.saveButton.textContent = "Save Signature";
        this.saveButton.disabled = false;
      }
    });
  }

  toggleRecording() {
    if (!this.isRecording && !this.isPostRecording) {
      this.startRecording();
    } else if (this.isPostRecording) {
      this.cancelPostRecording();
    }
  }

  saveSignature() {
    // Implementation of saveSignature method
  }
}
