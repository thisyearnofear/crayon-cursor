// blockchain.js
// Service for blockchain interactions

import { createSignatureCoin, validateMetadata } from "../coins/zora-coins.js";
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
 * @param {Function} [options.onProgress] - Optional callback for progress updates
 * @returns {Promise<Object>} A promise that resolves to the minting result
 */
export async function mintSignature({
  name,
  symbol,
  imageDataUrl,
  payoutRecipient,
  description,
  onProgress = () => {},
}) {
  try {
    // Step 1: Convert data URL to blob and pin to IPFS
    onProgress("Converting image and uploading to IPFS...");
    const signatureBlob = dataUrlToBlob(imageDataUrl);
    const ipfsImageUri = await pinFileWithPinata(signatureBlob);
    console.log("Image uploaded to IPFS:", ipfsImageUri);

    // Step 2: Build metadata JSON with the IPFS image URL
    onProgress("Building metadata...");
    const metadataJson = buildSignatureMetadata({
      name,
      imageUrl: ipfsImageUri,
      description: description || "A unique signature minted as an NFT.",
    });
    console.log("Metadata built:", metadataJson);

    // Step 2.5: Validate metadata with our server
    onProgress("Validating metadata...");
    try {
      // Use environment variable for API URL if available, otherwise fallback to localhost
      const apiBaseUrl = process.env.VITE_API_URL || "http://localhost:3000";
      const validateResponse = await fetch(
        `${apiBaseUrl}/api/validate-metadata`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadataJson),
        }
      );

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        throw new Error(
          `Metadata validation failed: ${errorData.error || "Unknown error"}`
        );
      }

      console.log("Metadata validation successful");
    } catch (validationError) {
      console.error("Metadata validation error:", validationError);
      throw validationError;
    }

    // Step 3: Pin metadata JSON to IPFS
    onProgress("Uploading metadata to IPFS...");
    const metadataUri = await pinJsonWithPinata(metadataJson);
    console.log("Metadata uploaded to IPFS:", metadataUri);

    // Step 3.5: Add a delay to ensure IPFS content is available
    onProgress("Waiting for IPFS content to propagate...");
    console.log("Waiting for IPFS content to propagate...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("IPFS propagation delay complete");

    // Step 3.6: Validate the metadata with our custom validator
    onProgress("Validating metadata with custom validator...");
    try {
      // Validate the metadata URI
      await validateMetadata(metadataUri);
      console.log("Custom metadata validation successful");

      // Double-check the metadata content using our proxy server
      onProgress("Verifying metadata content...");
      const ipfsHash = metadataUri.replace("ipfs://", "");
      // Use environment variable for API URL if available, otherwise fallback to localhost
      const apiBaseUrl = process.env.VITE_API_URL || "http://localhost:3000";
      const proxyUrl = `${apiBaseUrl}/api/ipfs/${ipfsHash}`;

      const metadataResponse = await fetch(proxyUrl);
      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw new Error(
          errorData.error || `Proxy server error: ${metadataResponse.status}`
        );
      }

      const result = await metadataResponse.json();
      const metadata = result.content;
      const successGateway = result.source;

      console.log(`Metadata content verified via ${successGateway}:`, metadata);

      // Verify the image URL
      const imageUrl = metadata.image;
      if (!imageUrl || !imageUrl.startsWith("ipfs://")) {
        throw new Error(`Invalid image URL in metadata: ${imageUrl}`);
      }

      console.log("Metadata validation complete and successful");
    } catch (validationError) {
      console.error("Custom metadata validation error:", validationError);
      throw new Error(`Metadata validation failed: ${validationError.message}`);
    }

    // Step 4: Mint using the IPFS metadata URI
    onProgress("Creating signature coin on Base network...");
    onProgress("Please approve the transaction in your wallet...");

    const result = await createSignatureCoin({
      name,
      symbol: symbol.toUpperCase(),
      metadataUri,
      payoutRecipient,
      account: payoutRecipient,
      // Don't specify an RPC URL - let the wallet handle it
      platformReferrer: "0x55A5705453Ee82c742274154136Fce8149597058",
    });

    onProgress("Transaction submitted! Waiting for confirmation...");

    // Wait for transaction confirmation
    try {
      if (result.transactionHash) {
        onProgress(
          `Transaction confirmed! Hash: ${result.transactionHash.slice(
            0,
            10
          )}...`
        );
      }
      onProgress("Transaction submitted successfully!");

      return {
        ...result,
        metadataUri,
        ipfsImageUri,
      };
    } catch (confirmError) {
      console.error("Error confirming transaction:", confirmError);
      throw new Error(
        `Transaction may have been submitted but confirmation failed: ${confirmError.message}`
      );
    }
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
