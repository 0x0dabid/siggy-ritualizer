import type { Hex } from "viem";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function truncateAddress(value?: string) {
  if (!value) return "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function getFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  const lower = message.toLowerCase();

  if (lower.includes("user rejected") || lower.includes("rejected")) {
    return "Request rejected in wallet. Nothing was changed.";
  }
  if (lower.includes("insufficient funds")) {
    return "Not enough testnet RITUAL for gas. Use the faucet and try again.";
  }
  if (lower.includes("chain") || lower.includes("network")) {
    return "Wrong network. Switch to Ritual Testnet and try again.";
  }
  if (lower.includes("contract address")) {
    return "Missing NFT contract address. Deploy the contract and set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS.";
  }

  return message;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function explorerTxUrl(hash?: Hex) {
  return hash ? `https://explorer.ritualfoundation.org/tx/${hash}` : undefined;
}

export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
