// ipfs.js
// Service for interacting with IPFS via Pinata

/**
 * Pins a file to IPFS via our proxy server
 * @param {Blob} file - The file to pin
 * @returns {Promise<string>} A promise that resolves to the IPFS URI
 */
export async function pinFileWithPinata(file) {
  try {
    const data = new FormData();
    data.append("file", file);

    // Use our proxy server instead of calling Pinata directly
    // This keeps our Pinata JWT secure on the server
    // Use environment variable for API URL if available, otherwise fallback to localhost
    const apiBaseUrl = process.env.VITE_API_URL || "http://localhost:3000";
    const apiUrl = `${apiBaseUrl}/api/pin-file`;

    const res = await fetch(apiUrl, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Proxy server error (${res.status})`);
    }

    const result = await res.json();
    return `ipfs://${result.ipfsHash}`;
  } catch (error) {
    console.error("Error pinning file to IPFS:", error);
    throw error;
  }
}

/**
 * Pins JSON metadata to IPFS via our proxy server
 * @param {Object} json - The JSON object to pin
 * @returns {Promise<string>} A promise that resolves to the IPFS URI
 */
export async function pinJsonWithPinata(json) {
  try {
    // Use our proxy server instead of calling Pinata directly
    // This keeps our Pinata JWT secure on the server
    // Use environment variable for API URL if available, otherwise fallback to localhost
    const apiBaseUrl = process.env.VITE_API_URL || "http://localhost:3000";
    const apiUrl = `${apiBaseUrl}/api/pin-json`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Proxy server error (${res.status})`);
    }

    const result = await res.json();
    return `ipfs://${result.ipfsHash}`;
  } catch (error) {
    console.error("Error pinning JSON to IPFS:", error);
    throw error;
  }
}

/**
 * Gets the gateway URL for an IPFS URI
 * @param {string} ipfsUri - The IPFS URI
 * @returns {string} The gateway URL
 */
export function getIpfsGatewayUrl(ipfsUri) {
  if (!ipfsUri) return "";

  if (ipfsUri.startsWith("ipfs://")) {
    const hash = ipfsUri.replace("ipfs://", "");

    // Check if we have a custom Pinata gateway in the environment
    const pinataGateway = window.ENV?.PINATA_GATEWAY;
    if (pinataGateway) {
      return `https://${pinataGateway}/ipfs/${hash}`;
    }

    // Use Pinata gateway which should be more reliable
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
    // Alternative gateways:
    // return `https://ipfs.io/ipfs/${hash}`;
    // return `https://dweb.link/ipfs/${hash}`;
  }

  return ipfsUri;
}
