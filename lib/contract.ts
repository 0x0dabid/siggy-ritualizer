import type { Address } from "viem";

export const NFT_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as Address;

export const ritualizedPfpAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenURI", type: "string" }],
    outputs: [{ name: "tokenId", type: "uint256" }]
  },
  {
    type: "function",
    name: "nextTokenId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "event",
    name: "PfpMinted",
    inputs: [
      { name: "minter", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "tokenURI", type: "string", indexed: false }
    ]
  }
] as const;

export function hasContractAddress(address = NFT_CONTRACT_ADDRESS) {
  return address !== "0x0000000000000000000000000000000000000000";
}
