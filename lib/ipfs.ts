type PinataFileResponse = {
  IpfsHash: string;
};

export type UploadedMetadata = {
  imageUri: string;
  metadataUri: string;
  tokenUri: string;
};

function getPinataJwt() {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error("Missing PINATA_JWT. Add a Pinata JWT before minting.");
  }
  return jwt;
}

function dataUrlToBlob(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Generated image is not a valid data URL.");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

async function pinFile(buffer: Buffer, filename: string, mimeType: string) {
  const formData = new FormData();
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  const bytes = new Uint8Array(arrayBuffer);
  formData.append("file", new Blob([bytes], { type: mimeType }), filename);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPinataJwt()}`
    },
    body: formData
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`IPFS image upload failed: ${detail}`);
  }

  const json = (await response.json()) as PinataFileResponse;
  return `ipfs://${json.IpfsHash}`;
}

async function pinJson(metadata: Record<string, unknown>) {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPinataJwt()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: "siggy-ritualizer-metadata.json"
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`IPFS metadata upload failed: ${detail}`);
  }

  const json = (await response.json()) as PinataFileResponse;
  return `ipfs://${json.IpfsHash}`;
}

export async function uploadGeneratedPfpToIpfs(imageDataUrl: string, nextTokenId?: string) {
  const { buffer, mimeType } = dataUrlToBlob(imageDataUrl);
  const imageUri = await pinFile(buffer, "siggy-ritualizer.png", mimeType);
  const displayId = nextTokenId || Date.now().toString();

  const metadata = {
    name: `Siggy Ritualizer #${displayId}`,
    description: "AI-generated Ritual Testnet PFP. No real value.",
    image: imageUri,
    attributes: [
      { trait_type: "Generator", value: "Siggy Ritualizer" },
      { trait_type: "Network", value: "Ritual Testnet" },
      { trait_type: "Status", value: "Testnet" }
    ]
  };

  const metadataUri = await pinJson(metadata);
  return {
    imageUri,
    metadataUri,
    tokenUri: metadataUri
  } satisfies UploadedMetadata;
}
