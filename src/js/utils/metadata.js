// Utility to build Zora-compatible metadata JSON for a signature NFT
// Following EIP-7572 standard for Zora Coins
// Usage: buildSignatureMetadata({ name, imageUrl, description })

/**
 * Validates metadata against Zora Coins requirements (EIP-7572 standard)
 * @param {Object} metadata - The metadata object to validate
 * @returns {boolean} True if valid, throws error if invalid
 */
export function validateMetadata(metadata) {
  console.log("Validating metadata:", metadata);

  if (!metadata.name || typeof metadata.name !== "string") {
    throw new Error("Metadata must include a name as a string");
  }

  if (!metadata.description || typeof metadata.description !== "string") {
    throw new Error("Metadata must include a description as a string");
  }

  if (!metadata.image || typeof metadata.image !== "string") {
    throw new Error("Metadata must include an image URL as a string");
  }

  // For Zora Coins, image MUST be an IPFS URL
  if (!metadata.image.startsWith("ipfs://")) {
    throw new Error("Image URL must start with ipfs:// for Zora Coins");
  }

  // Check properties object
  if (!metadata.properties || typeof metadata.properties !== "object") {
    throw new Error("Metadata must include a properties object");
  }

  // Check category property
  if (
    !metadata.properties.category ||
    typeof metadata.properties.category !== "string"
  ) {
    throw new Error("Metadata properties must include a category as a string");
  }

  console.log("Metadata validation passed");
  return true;
}

/**
 * Builds metadata for a signature NFT following EIP-7572 standard for Zora Coins
 * @param {Object} options - Metadata options
 * @param {string} options.name - The name of the NFT
 * @param {string} options.imageUrl - The IPFS URL of the image
 * @param {string} options.description - The description of the NFT
 * @returns {Object} The metadata object
 */
export function buildSignatureMetadata({ name, imageUrl, description }) {
  // Ensure the image URL starts with ipfs://
  if (!imageUrl.startsWith("ipfs://")) {
    throw new Error("Image URL must start with ipfs:// for Zora Coins");
  }

  const metadata = {
    name: name || "Signature Opal",
    description: description || "A unique signature minted as an NFT.",
    image: imageUrl,
    properties: {
      category: "signature",
      type: "image",
    },
  };

  // Validate before returning
  validateMetadata(metadata);

  console.log("Built metadata for Zora Coins:", metadata);

  return metadata;
}
