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
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    console.log(`Using API URL: ${apiBaseUrl}`);
    const apiUrl = `${apiBaseUrl}/api/pin-file`;

    const res = await fetch(apiUrl, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || `Proxy server error (${res.status})`;
        console.error("Detailed error from proxy server:", errorData);
      } catch (parseError) {
        // If the response is not JSON, get the text
        const errorText = await res.text();
        errorMessage = `Proxy server error (${
          res.status
        }): ${errorText.substring(0, 100)}`;
        console.error("Raw error from proxy server:", errorText);
      }
      throw new Error(errorMessage);
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
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    console.log(`Using API URL for JSON pinning: ${apiBaseUrl}`);
    const apiUrl = `${apiBaseUrl}/api/pin-json`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });

    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || `Proxy server error (${res.status})`;
        console.error(
          "Detailed error from proxy server (JSON pinning):",
          errorData
        );
      } catch (parseError) {
        // If the response is not JSON, get the text
        const errorText = await res.text();
        errorMessage = `Proxy server error (${
          res.status
        }): ${errorText.substring(0, 100)}`;
        console.error("Raw error from proxy server (JSON pinning):", errorText);
      }
      throw new Error(errorMessage);
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

/**
 * Checks if the backend API is accessible
 * @returns {Promise<boolean>} True if the API is accessible, false otherwise
 */
export async function checkApiHealth() {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    console.log(`Checking API health at: ${apiBaseUrl}`);

    const response = await fetch(`${apiBaseUrl}/api/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`API health check failed: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log("API health check response:", data);
    return true;
  } catch (error) {
    console.error("API health check error:", error);
    return false;
  }
}
