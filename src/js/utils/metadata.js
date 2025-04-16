// Utility to build Zora-compatible metadata JSON for a signature NFT
// Usage: buildSignatureMetadata({ name, imageUrl, description })
export function buildSignatureMetadata({ name, imageUrl, description }) {
  return {
    name: name || 'Signature Opal',
    description: description || 'A unique signature minted as an NFT.',
    image: imageUrl,
    attributes: [
      {
        trait_type: 'Type',
        value: 'Signature',
      },
    ],
  };
}
