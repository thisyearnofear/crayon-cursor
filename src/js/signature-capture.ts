import { StorageClient } from '@lens-chain/storage-client';
import { chains } from '@lens-chain/sdk/viem';

export class SignatureCapture {
  private storageClient: any;
  private isRecording: boolean = false;
  private startTime: number | null = null;
  private drawingData: Array<{x: number, y: number, time: number}> = [];
  private maxDuration: number = 30000; // 30 seconds max

  constructor() {
    this.storageClient = StorageClient.create();
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

  recordPoint(x: number, y: number) {
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

  getRemainingTime(): number {
    if (!this.isRecording || !this.startTime) return this.maxDuration;
    const elapsed = Date.now() - this.startTime;
    return Math.max(0, this.maxDuration - elapsed);
  }

  async saveToIPFS() {
    if (this.drawingData.length === 0) {
      throw new Error('No drawing data to save');
    }

    const metadata = {
      name: 'Signature Drawing',
      description: 'A unique signature created with the crayon cursor',
      created: new Date().toISOString(),
      drawingData: this.drawingData,
      version: '1.0.0'
    };

    try {
      // Upload as immutable content
      const response = await this.storageClient.uploadAsJson(metadata, {
        acl: { template: 'immutable', chain_id: chains.testnet.id }
      });

      await response.waitForPropagation();
      
      return {
        uri: response.uri,
        gatewayUrl: response.gatewayUrl,
        storageKey: response.storageKey
      };
    } catch (error) {
      console.error('Failed to save signature:', error);
      throw error;
    }
  }
}
