import { BaseSignatureControls } from "./base-controls.js";

export class DesktopSignatureControls extends BaseSignatureControls {
  constructor(canvasManager) {
    super(canvasManager);
    this.createUI();
    this.attachEventListeners();
  }

  createUI() {
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

    // Create and add timer display
    this.timerDisplay =
      this.createTimerDisplay().querySelector(".timer-display");
    controlsContainer.appendChild(this.timerDisplay.parentElement);

    // Create and add status text
    this.statusText = this.createStatusText().querySelector(".status-text");
    controlsContainer.appendChild(this.statusText.parentElement);

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    `;

    // Create and add record button
    const recordButtonContainer = this.createRecordButton();
    this.recordButton = recordButtonContainer.querySelector(".record-button");
    buttonContainer.appendChild(recordButtonContainer);

    // Create and add save button
    const saveButtonContainer = this.createSaveButton();
    this.saveButton = saveButtonContainer.querySelector(".save-button");
    buttonContainer.appendChild(saveButtonContainer);

    controlsContainer.appendChild(buttonContainer);

    // Add to document
    document.body.appendChild(controlsContainer);

    // Store reference
    this.container = controlsContainer;
  }

  attachEventListeners() {
    super.attachEventListeners();
  }
}
