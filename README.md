# Siggy Ritualizer

Upload your image. Let Siggy ritualize it into a mystical AI avatar, then mint it on Ritual Testnet.

Siggy Ritualizer is a simple Web3 PFP generator dApp. Users upload an image, generate a mystical Siggy manga-cover avatar through a backend OpenAI image edit route, upload the generated image and NFT metadata to IPFS, then mint the PFP as an ERC721 on Ritual Testnet.

**Ritual Testnet only. No real value.**

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- wagmi + viem with a clean MetaMask-only connect flow
- OpenAI image edit API through `POST /api/generate`
- Pinata IPFS uploads through `POST /api/ipfs`
- Solidity + Hardhat + OpenZeppelin ERC721
- Ritual Testnet: chain ID `1979`, RPC `https://rpc.ritualfoundation.org`

## Setup

```bash
npm install
cp .env.example .env.local
cp .env.example .env
```

Fill in:

```bash
OPENAI_API_KEY=
PINATA_JWT=
RITUAL_RPC_URL=https://rpc.ritualfoundation.org
PRIVATE_KEY=
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=
```

The OpenAI key and Pinata JWT are only used server-side. Do not prefix them with `NEXT_PUBLIC_`.

## OpenAI Prompt

Edit `lib/openai.ts`:

```ts
export const BACKEND_IMAGE_PROMPT = `PASTE_MY_BACKEND_PROMPT_HERE`;
export const THEME_REFERENCE_IMAGE_PATH = `/reference/theme.png`;
```

To add a visual style reference, place a PNG at `public/reference/theme.png`. The backend includes it automatically when present.

## Deploy Contract To Ritual Testnet

Get testnet RITUAL from:

https://faucet.ritualfoundation.org

Compile and deploy:

```bash
npm run compile
npm run deploy:ritual
```

Copy the deployed contract address into:

```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
```

Restart the dev server after changing environment variables.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

The intended flow is:

1. Upload PNG, JPG, or WebP.
2. Generate Siggy.
3. Click Mint on Ritual.
4. Connect MetaMask only when prompted.
5. Switch to Ritual Testnet if needed.
6. Upload image and metadata to IPFS.
7. Confirm the mint transaction.
8. Share the minted PFP on X.

## Vercel Deployment

1. Push the project to GitHub.
2. Import it in Vercel.
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `PINATA_JWT`
   - `NEXT_PUBLIC_RITUAL_CHAIN_ID=1979`
   - `NEXT_PUBLIC_RITUAL_RPC_URL=https://rpc.ritualfoundation.org`
   - `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...`
4. Deploy.

Do not add `PRIVATE_KEY` to Vercel unless you are running server-side deployment tasks there. The app does not need it at runtime.

## Notes

- Wallet connection is intentionally deferred until minting.
- Minting is free except for Ritual Testnet gas.
- This MVP does not include marketplace features, profiles, sign-in, or mainnet support.
- Generated metadata says: `AI-generated Ritual Testnet PFP. No real value.`
