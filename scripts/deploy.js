// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // 1. On récupère la factory (l'usine) du contrat
  const MonopolyNFT = await hre.ethers.getContractFactory("MonopolyNFT");

  // 2. On déploie le contrat
  const monopolyNFT = await MonopolyNFT.deploy(); // Si votre constructeur prend des params, ajoutez-les ici.

  // 3. On attend la confirmation
  await monopolyNFT.deployed();

  console.log("MonopolyNFT déployé à l'adresse :", monopolyNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
