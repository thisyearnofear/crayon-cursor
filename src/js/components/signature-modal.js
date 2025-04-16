// signature-modal.js
// Unified signature modal component for both preview and mobile drawing

import { ModalBase } from "./modal-base.js";
import {
  createButton,
  createContainer,
  createFormInput,
} from "../utils/dom.js";
import { cropBottomThird } from "../utils/image.js";
import { saveToGrove, lensToHttpUrl } from "../services/storage.js";
import { mintSignature } from "../services/blockchain.js";

export class SignatureModal extends ModalBase {
  constructor(options = {}) {
    super({
      title: options.title || "Signature",
      width: options.width || "450px",
      className: "signature-modal",
      onClose: options.onClose,
    });

    this.onSave = options.onSave;
    this.onMint = options.onMint;
    this.isMobile = options.isMobile || false;

    this.previewImage = null;
    this.canvas = null;
    this.ctx = null;
    this.buttons = null;
    this.saveButton = null;
    this.mintButton = null;
    this.cancelButton = null;
    this.resultContainer = null;
    this.savedMetadataUri = null;

    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    this.setupModalContent();

    if (this.isMobile) {
      this.setupMobileDrawing();
    }
  }

  setupModalContent() {
    // Clear existing content except status message
    const statusMessage = this.statusMessage;
    this.content.innerHTML = "";
    this.content.appendChild(statusMessage);

    if (this.isMobile) {
      // Canvas for mobile drawing
      this.canvas = document.createElement("canvas");
      this.canvas.width = 340;
      this.canvas.height = 220;
      this.canvas.style.cssText =
        "background:#fff;border:2px solid #FC0E49;border-radius:8px;touch-action:none;";
      this.ctx = this.canvas.getContext("2d");
      this.content.appendChild(this.canvas);
    } else {
      // Preview image for desktop
      this.previewImage = document.createElement("img");
      this.previewImage.style.cssText =
        "max-width: 100%; border-radius: 8px; margin-bottom: 15px;";
      this.content.appendChild(this.previewImage);
    }

    // Buttons
    this.buttons = createContainer({
      className: "modal-buttons",
      style:
        "display: flex; gap: 10px; margin-top: 15px; justify-content: center;",
    });

    this.saveButton = createButton({
      text: "Save",
      className: "signature-button",
      style:
        "background: #7A200C; color: white; padding: 8px 16px; border-radius: 6px;",
    });

    this.mintButton = createButton({
      text: "Mint",
      className: "signature-button mint",
      style:
        "background: #FC0E49; color: white; padding: 8px 16px; border-radius: 6px;",
    });

    this.cancelButton = createButton({
      text: "Cancel",
      className: "signature-button",
      style:
        "background: #f5f5f5; color: #333; padding: 8px 16px; border-radius: 6px;",
      onClick: () => this.hide(),
    });

    this.buttons.appendChild(this.saveButton);
    this.buttons.appendChild(this.mintButton);
    this.buttons.appendChild(this.cancelButton);
    this.content.appendChild(this.buttons);

    // Set up button handlers
    this.setupButtonHandlers();
  }

  setupButtonHandlers() {
    // Save button handler
    this.saveButton.onclick = async () => {
      const imageDataUrl = this.isMobile
        ? this.canvas.toDataURL("image/png")
        : this.previewImage.src;

      await this.saveToGrove(imageDataUrl);
    };

    // Mint button handler
    this.mintButton.onclick = async () => {
      const imageDataUrl = this.isMobile
        ? this.canvas.toDataURL("image/png")
        : this.previewImage.src;

      this.showMintForm(imageDataUrl);
    };
  }

  setupMobileDrawing() {
    // Touch event handlers for mobile drawing
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.isDrawing = true;
      this.lastX = touch.clientX - rect.left;
      this.lastY = touch.clientY - rect.top;
    });

    this.canvas.addEventListener("touchmove", (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.lastX = x;
      this.lastY = y;
    });

    this.canvas.addEventListener("touchend", () => {
      this.isDrawing = false;
    });

    // Add clear button for mobile
    const clearBtn = createButton({
      text: "Clear",
      className: "signature-button",
      style:
        "background: #f5f5f5; color: #333; padding: 8px 16px; border-radius: 6px;",
      onClick: () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      },
    });

    // Insert clear button before cancel button
    this.buttons.insertBefore(clearBtn, this.cancelButton);
  }

  async show(imageDataUrl) {
    if (!this.isMobile && imageDataUrl) {
      // For desktop preview, crop the image
      const croppedDataUrl = await cropBottomThird(imageDataUrl);
      this.previewImage.src = croppedDataUrl;
    }

    super.show();
  }

  async saveToGrove(imageDataUrl, afterSaveCallback) {
    this.buttons.style.display = "none";
    this.setStatus("Processing", "#888");

    try {
      const result = await saveToGrove(imageDataUrl);
      this.savedMetadataUri = result.uri;

      if (afterSaveCallback) {
        afterSaveCallback(result.uri);
      } else {
        this.showResult({
          imageUrl: result.imageUrl,
          uri: result.uri,
          imageDataUrl,
        });
      }
    } catch (error) {
      this.setStatus("Save failed: " + (error.message || error), "#D32F2F");
    } finally {
      this.buttons.style.display = "flex";
    }
  }

  showResult({ imageUrl, uri, imageDataUrl }) {
    // Show success status
    this.setStatus("Signed", "#22a722");

    // Remove old result if present
    if (this.resultContainer) {
      this.resultContainer.remove();
    }

    // Create result container
    this.resultContainer = document.createElement("div");
    this.resultContainer.className = "result-container";
    this.resultContainer.style.cssText =
      "margin-top: 15px; text-align: center;";

    // Create URL label and link
    const urlLabel = document.createElement("div");
    urlLabel.textContent = "Your signature is stored at:";
    urlLabel.style.cssText = "margin-bottom: 8px; font-weight: 500;";

    const urlLink = document.createElement("a");
    urlLink.href = lensToHttpUrl(uri);
    urlLink.textContent = uri;
    urlLink.target = "_blank";
    urlLink.style.cssText =
      "display: block; word-break: break-all; margin-bottom: 12px;";

    // Create download button
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download Signature";
    downloadBtn.onclick = () => {
      const link = document.createElement("a");
      link.href = imageDataUrl;
      link.download = "signature.png";
      link.click();
    };
    downloadBtn.className = "signature-button";
    downloadBtn.style.cssText =
      "margin-top: 8px; background: #7A200C; color: white; padding: 7px 18px; border-radius: 6px; text-align: center;";

    this.resultContainer.appendChild(urlLabel);
    this.resultContainer.appendChild(urlLink);
    this.resultContainer.appendChild(downloadBtn);
    this.content.appendChild(this.resultContainer);

    // Show modal if not already visible
    this.show();
  }

  showMintForm(imageDataUrl) {
    // Hide buttons
    this.buttons.style.display = "none";

    // Create mint form
    const mintForm = document.createElement("div");
    mintForm.className = "mint-form";
    mintForm.style.cssText = "margin-top: 15px; width: 100%;";

    // Form inputs
    const nameInput = createFormInput({
      id: "mint-name",
      label: "Name",
      value: "Signature Opal",
      placeholder: "Enter a name for your signature",
    });

    const symbolInput = createFormInput({
      id: "mint-symbol",
      label: "Symbol",
      value: "SIG",
      placeholder: "Enter a symbol (3-4 letters)",
    });

    const payoutInput = createFormInput({
      id: "mint-payout",
      label: "Payout Address",
      value: "", // Will be filled with connected wallet
      placeholder: "Enter your wallet address",
    });

    const descriptionInput = createFormInput({
      id: "mint-description",
      label: "Description",
      value: "A unique signature minted as an NFT.",
      placeholder: "Enter a description for your signature",
    });

    // Result div
    const resultDiv = document.createElement("div");
    resultDiv.style.cssText = "margin-top: 15px; min-height: 60px;";

    // Form buttons
    const formButtons = createContainer({
      style:
        "display: flex; gap: 10px; margin-top: 15px; justify-content: center;",
    });

    const mintFormBtn = createButton({
      text: "Mint NFT",
      className: "signature-button mint",
      style:
        "background: #FC0E49; color: white; padding: 8px 16px; border-radius: 6px;",
    });

    const mintCancelBtn = createButton({
      text: "Cancel",
      className: "signature-button",
      style:
        "background: #f5f5f5; color: #333; padding: 8px 16px; border-radius: 6px;",
      onClick: () => {
        mintForm.remove();
        this.buttons.style.display = "flex";
      },
    });

    formButtons.appendChild(mintFormBtn);
    formButtons.appendChild(mintCancelBtn);

    // Assemble form
    mintForm.appendChild(nameInput);
    mintForm.appendChild(symbolInput);
    mintForm.appendChild(payoutInput);
    mintForm.appendChild(descriptionInput);
    mintForm.appendChild(resultDiv);
    mintForm.appendChild(formButtons);

    // Add form to modal
    this.content.appendChild(mintForm);

    // Try to fill payout address with connected wallet
    try {
      const wallet = window.wallet;
      if (wallet && wallet.getAccount) {
        payoutInput.querySelector("input").value = wallet.getAccount();
      }
    } catch (e) {
      console.error("Failed to get wallet account:", e);
    }

    // Optimize the image for minting
    const prepareImageForMinting = async () => {
      try {
        // First optimize the image to ensure it's a proper PNG
        const { optimizeImageForMinting } = await import("../utils/image.js");
        return await optimizeImageForMinting(imageDataUrl);
      } catch (error) {
        console.error("Failed to optimize image:", error);
        return imageDataUrl; // Fall back to original image
      }
    };

    // Mint button handler
    mintFormBtn.onclick = async () => {
      resultDiv.textContent = "Minting...";
      resultDiv.style.color = "#7A200C";
      mintFormBtn.disabled = true;
      mintCancelBtn.disabled = true;

      try {
        // Prepare the image
        const optimizedImageDataUrl = await prepareImageForMinting();

        // Get form values
        const name = nameInput.querySelector("input").value;
        const symbol = symbolInput.querySelector("input").value;
        const payoutRecipient = payoutInput.querySelector("input").value;
        const description = descriptionInput.querySelector("input").value;

        // Validate inputs
        if (!name) throw new Error("Name is required");
        if (!symbol) throw new Error("Symbol is required");
        if (!payoutRecipient) throw new Error("Payout address is required");
        if (symbol.length > 4)
          throw new Error("Symbol should be 4 characters or less");

        // Mint the signature
        const result = await mintSignature({
          name,
          symbol,
          imageDataUrl: optimizedImageDataUrl,
          payoutRecipient,
          description,
        });

        // Format the result for display
        const { formatMintResult } = await import("../services/blockchain.js");
        const { getIpfsGatewayUrl } = await import("../services/ipfs.js");
        const formattedResult = formatMintResult(result);

        // Show success message with links
        resultDiv.innerHTML = `
          <div style='color:#22a722;font-weight:bold;margin-bottom:10px;'>Minted Successfully!</div>
          <div style='margin-bottom:5px;'><b>Coin Address:</b> <a href='${
            formattedResult.explorerLinks.address
          }' target='_blank'>${formattedResult.address.slice(
          0,
          6
        )}...${formattedResult.address.slice(-4)}</a></div>
          <div style='margin-bottom:5px;'><b>Transaction:</b> <a href='${
            formattedResult.explorerLinks.transaction
          }' target='_blank'>${formattedResult.txHash.slice(
          0,
          6
        )}...${formattedResult.txHash.slice(-4)}</a></div>
          <div style='margin-bottom:5px;'><b>Metadata:</b> <a href='${getIpfsGatewayUrl(
            formattedResult.metadataUri
          )}' target='_blank'>View Metadata</a></div>
          <div style='margin-bottom:10px;'><b>Image:</b> <a href='${getIpfsGatewayUrl(
            formattedResult.ipfsImageUri
          )}' target='_blank'>View Image</a></div>
        `;

        // Add a "Done" button
        const doneBtn = createButton({
          text: "Done",
          className: "signature-button",
          style:
            "background: #22a722; color: white; padding: 8px 16px; border-radius: 6px; margin-top: 10px;",
          onClick: () => {
            this.hide();
          },
        });

        resultDiv.appendChild(doneBtn);

        // Hide the form buttons
        formButtons.style.display = "none";
      } catch (err) {
        resultDiv.textContent = "Mint failed: " + (err.message || err);
        resultDiv.style.color = "#D32F2F";
        mintFormBtn.disabled = false;
        mintCancelBtn.disabled = false;
      }
    };
  }
}
