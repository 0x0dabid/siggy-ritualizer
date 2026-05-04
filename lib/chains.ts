import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export const RITUAL_CHAIN_ID = Number(process.env.NEXT_PUBLIC_RITUAL_CHAIN_ID ?? 1979);
export const RITUAL_RPC_URL =
  process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? "https://rpc.ritualfoundation.org";

export const ritualChain = defineChain({
  id: RITUAL_CHAIN_ID,
  name: "Ritual Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "RITUAL",
    symbol: "RITUAL"
  },
  rpcUrls: {
    default: {
      http: [RITUAL_RPC_URL],
      webSocket: ["wss://rpc.ritualfoundation.org/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ritual Explorer",
      url: "https://explorer.ritualfoundation.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0x5577Ea679673Ec7508E9524100a188E7600202a3"
    }
  },
  testnet: true
});

export const wagmiConfig = createConfig({
  chains: [ritualChain],
  connectors: [injected()],
  transports: {
    [ritualChain.id]: http(RITUAL_RPC_URL)
  },
  ssr: true
});

export async function addRitualToWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask was not found. Install MetaMask to mint on Ritual Testnet.");
  }

  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: `0x${ritualChain.id.toString(16)}`,
        chainName: ritualChain.name,
        nativeCurrency: ritualChain.nativeCurrency,
        rpcUrls: ritualChain.rpcUrls.default.http,
        blockExplorerUrls: [ritualChain.blockExplorers.default.url]
      }
    ]
  });
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}
