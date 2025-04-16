// Utility for pinning files and JSON metadata to Pinata using JWT from .env
// Requires: PINATA_JWT in process.env

export async function pinFileWithPinata(file) {
  const data = new FormData();
  data.append('file', file);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: data,
  });

  if (!res.ok) {
    throw new Error(`Pinata file pin failed: ${res.statusText}`);
  }
  const result = await res.json();
  return `ipfs://${result.IpfsHash}`;
}

export async function pinJsonWithPinata(json) {
  const data = JSON.stringify({
    pinataContent: json,
    pinataMetadata: { name: 'metadata.json' },
  });

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: data,
  });

  if (!res.ok) {
    throw new Error(`Pinata JSON pin failed: ${res.statusText}`);
  }
  const result = await res.json();
  return `ipfs://${result.IpfsHash}`;
}
