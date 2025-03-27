import { StorageClient } from '@lens-chain/storage-client';

export class SignatureCapture {
  constructor() {
    this.storageClient = StorageClient.create();
    this.isRecording = false;
    this.startTime = null;
    this.drawingData = [];
    this.maxDuration = 10000; // 10 seconds max
  }

  startRecording() {
    this.isRecording = true;
    this.startTime = Date.now();
    this.drawingData = [];
  }

  stopRecording() {
    this.isRecording = false;
    this.startTime = null;
    return this.drawingData;
  }

  recordPoint(x, y) {
    if (!this.isRecording || !this.startTime) return;
    
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    
    // Stop recording if max duration reached
    if (elapsedTime > this.maxDuration) {
      this.stopRecording();
      return;
    }

    this.drawingData.push({
      x,
      y,
      time: elapsedTime
    });
  }

  getRemainingTime() {
    if (!this.isRecording || !this.startTime) return this.maxDuration;
    const elapsed = Date.now() - this.startTime;
    return Math.max(0, this.maxDuration - elapsed);
  }

  async saveToGrove(canvasManager, imageDataUrl = null) {
    if (this.drawingData.length === 0) {
      throw new Error('No drawing data to save');
    }

    // Get the canvas image
    // Use provided image URL or capture new one
    const finalImageUrl = imageDataUrl || canvasManager.captureCanvas();
    if (!finalImageUrl) {
      throw new Error('Failed to capture canvas image');
    }

    try {
      // Convert base64 to blob
      const base64Data = finalImageUrl.split(',')[1];
      const binaryStr = atob(base64Data);
      const byteNumbers = new Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
          byteNumbers[i] = binaryStr.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const imageBlob = new Blob([byteArray], { type: 'image/png' });
      
      // Upload directly using one-step method
      const response = await fetch('https://api.grove.storage/?chain_id=37111', {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png'
        },
        body: imageBlob
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed (${response.status}): ${errorText}`);
      }
      
      const [data] = await response.json();
      console.log('Upload successful:', data);
      
      return {
        message: 'Image uploaded to Grove',
        imageUrl: data.gateway_url,
        uri: data.uri
      };
    } catch (error) {
      console.error('Failed to save signature:', error);
      throw error;
    }
  }
}
