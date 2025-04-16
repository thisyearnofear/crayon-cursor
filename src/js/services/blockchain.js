// blockchain.js
// Service for blockchain interactions

import { createSignatureCoin } from "../coins/zora-coins.js";
import { dataUrlToBlob } from "../utils/image.js";
import { buildSignatureMetadata } from "../utils/metadata.js";
import { pinFileWithPinata, pinJsonWithPinata } from "./ipfs.js";

/**
 * Mints a signature as an NFT
 * @param {Object} options - Minting options
 * @param {string} options.name - The name of the NFT
 * @param {string} options.symbol - The symbol for the NFT
 * @param {string} options.imageDataUrl - The image data URL
 * @param {string} options.payoutRecipient - The payout recipient address
 * @param {string} [options.description] - Optional description
 * @returns {Promise<Object>} A promise that resolves to the minting result
 */
export async function mintSignature({
  name,
  symbol,
  imageDataUrl,
  payoutRecipient,
  description,
}) {
  try {
    // Step 1: Convert data URL to blob and pin to IPFS
    const signatureBlob = dataUrlToBlob(imageDataUrl);
    const ipfsImageUri = await pinFileWithPinata(signatureBlob);

    // Step 2: Build metadata JSON with the IPFS image URL
    const metadataJson = buildSignatureMetadata({
      name,
      imageUrl: ipfsImageUri,
      description: description || "A unique signature minted as an NFT.",
    });

    // Step 3: Pin metadata JSON to IPFS
    const metadataUri = await pinJsonWithPinata(metadataJson);

    // Step 4: Mint using the IPFS metadata URI
    const result = await createSignatureCoin({
      name,
      symbol: symbol.toUpperCase(),
      metadataUri,
      payoutRecipient,
      account: payoutRecipient,
      rpcUrl: "https://mainnet.base.org",
      platformReferrer: "0x55A5705453Ee82c742274154136Fce8149597058",
    });

    return {
      ...result,
      metadataUri,
      ipfsImageUri,
    };
  } catch (error) {
    console.error("Minting error:", error);
    throw error;
  }
}

/**
 * Formats blockchain data for display
 * @param {Object} result - The blockchain transaction result
 * @returns {Object} Formatted data for UI display
 */
export function formatMintResult(result) {
  return {
    success: true,
    address: result.address,
    txHash: result.hash,
    metadataUri: result.metadataUri,
    ipfsImageUri: result.ipfsImageUri,
    explorerLinks: {
      address: `https://basescan.org/address/${result.address}`,
      transaction: `https://basescan.org/tx/${result.hash}`,
    },
  };
}
