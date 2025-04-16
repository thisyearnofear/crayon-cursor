// mint-signature.js
// Shared minting logic for signature modals

import { buildSignatureMetadata } from '../utils/metadata.js';
import { pinJsonWithPinata, pinFileWithPinata } from '../utils/pinata.js';
import { createSignatureCoin } from '../coins/zora-coins.js';

export async function mintSignature({ name, symbol, imageDataUrl, payoutRecipient }) {
  // Convert DataURL to Blob
  function dataUrlToBlob(dataUrl) {
    const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
  }
  // Step 1: Pin image to IPFS
  const signatureBlob = dataUrlToBlob(imageDataUrl);
  const ipfsImageUri = await pinFileWithPinata(signatureBlob);
  // Step 2: Build metadata JSON
  const metadataJson = buildSignatureMetadata({
    name,
    imageUrl: ipfsImageUri,
    description: 'A unique signature minted as an NFT.'
  });
  // Step 3: Pin metadata JSON to Pinata
  const ipfsMetadataUri = await pinJsonWithPinata(metadataJson);
  // Step 4: Mint using the IPFS metadata URI
  const result = await createSignatureCoin({
    name,
    symbol: symbol.toUpperCase(),
    metadataUri: ipfsMetadataUri,
    payoutRecipient,
    account: payoutRecipient,
    rpcUrl: 'https://mainnet.base.org',
    platformReferrer: '0x55A5705453Ee82c742274154136Fce8149597058'
  });
  return { ...result, ipfsImageUri, ipfsMetadataUri };
}
