// storage.js
// Service for Grove storage interactions (for saving signatures, not minting)

import { dataUrlToBlob } from "../utils/image.js";

/**
 * Saves a signature image to Grove storage
 * @param {string} imageDataUrl - The image data URL
 * @returns {Promise<Object>} A promise that resolves to the storage result
 */
export async function saveToGrove(imageDataUrl) {
  try {
    // Convert base64 to blob
    const imageBlob = dataUrlToBlob(imageDataUrl);

    // Upload directly using one-step method
    const response = await fetch("https://api.grove.storage/?chain_id=37111", {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
      },
      body: imageBlob,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    return {
      uri: result.uri,
      imageUrl: result.uri.replace("lens://", "https://api.grove.storage/"),
      storageKey: result.storageKey,
    };
  } catch (error) {
    console.error("Failed to save to Grove:", error);
    throw error;
  }
}

/**
 * Converts a lens URI to an HTTP URL
 * @param {string} uri - The lens URI
 * @returns {string} The HTTP URL
 */
export function lensToHttpUrl(uri) {
  if (uri && uri.startsWith("lens://")) {
    return "https://api.grove.storage/" + uri.slice("lens://".length);
  }
  return uri;
}

/**
 * Gets a display-friendly version of a URI
 * @param {string} uri - The URI to format
 * @returns {string} A shortened, display-friendly version of the URI
 */
export function formatUriForDisplay(uri) {
  if (!uri) return "";

  // For lens URIs, convert to HTTP URL and shorten
  if (uri.startsWith("lens://")) {
    const httpUrl = lensToHttpUrl(uri);
    return httpUrl.length > 40
      ? httpUrl.substring(0, 20) +
          "..." +
          httpUrl.substring(httpUrl.length - 15)
      : httpUrl;
  }

  // For IPFS URIs, shorten the hash
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    return "ipfs://..." + hash.substring(hash.length - 10);
  }

  // For other URIs, just shorten if needed
  return uri.length > 40
    ? uri.substring(0, 20) + "..." + uri.substring(uri.length - 15)
    : uri;
}
