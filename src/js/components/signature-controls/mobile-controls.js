import { BaseSignatureControls } from "./base-controls.js";

export class MobileSignatureControls extends BaseSignatureControls {
  constructor(canvasManager) {
    super(canvasManager);
    this.createUI();
    this.attachEventListeners();
  }

  createUI() {
    // Create bottom bar for mobile
    const bottomBar = document.createElement("div");
    bottomBar.className = "bottom-bar";
    bottomBar.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 12px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 12px;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1001;
    `;

    // Create timer display
    const timerContainer = this.createTimerDisplay();
    this.timerDisplay = timerContainer.querySelector(".timer-display");
    this.timerDisplay.style.cssText += `
      margin: 0;
      font-size: 20px;
      position: relative;
    `;

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      position: relative;
    `;

    // Create record button container
    const recordButtonContainer = this.createRecordButton();
    this.recordButton = recordButtonContainer.querySelector(".record-button");
    recordButtonContainer.style.cssText += `
      margin: 0;
      position: relative;
    `;

    // Create save button container
    const saveButtonContainer = this.createSaveButton();
    this.saveButton = saveButtonContainer.querySelector(".save-button");
    saveButtonContainer.style.cssText += `
      margin: 0;
      position: relative;
    `;

    // Create status text
    const statusContainer = this.createStatusText();
    this.statusText = statusContainer.querySelector(".status-text");
    this.statusText.style.cssText += `
      display: none;
      margin: 0;
      font-size: 12px;
      position: relative;
    `;

    // Assemble bottom bar
    buttonContainer.appendChild(recordButtonContainer);
    buttonContainer.appendChild(saveButtonContainer);
    bottomBar.appendChild(timerContainer);
    bottomBar.appendChild(buttonContainer);
    bottomBar.appendChild(statusContainer);

    // Add to document
    document.body.appendChild(bottomBar);
    this.bottomBar = bottomBar;
  }

  attachEventListeners() {
    super.attachEventListeners();

    // Add touch events for mobile
    this.recordButton.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (!this.isRecording && !this.isPostRecording) {
        this.startRecording();
      } else if (this.isPostRecording) {
        this.cancelPostRecording();
      }
    });

    this.saveButton.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.saveSignature();
    });
  }

  startRecording() {
    super.startRecording();
    this.statusText.style.display = "block";
  }

  stopRecording() {
    super.stopRecording();
    this.statusText.style.display = "block";
  }

  cancelPostRecording() {
    super.cancelPostRecording();
    this.statusText.style.display = "none";
    this.countdown = 10; // Reset timer
    this.updateTimer(this.countdown);
  }
}
