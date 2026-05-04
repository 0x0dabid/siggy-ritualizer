import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SiggyRitualizer with:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "RITUAL");

  const SiggyRitualizer = await ethers.getContractFactory("SiggyRitualizer");
  const contract = await SiggyRitualizer.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SiggyRitualizer deployed to:", address);
  console.log("Set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
