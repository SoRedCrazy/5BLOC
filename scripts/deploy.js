const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const MonopolyNFT = await hre.ethers.getContractFactory("MonopolyNFT");
  const monopolyNFT = await MonopolyNFT.deploy();
  console.log("MonopolyNFT déployé à l'adresse :", await monopolyNFT.getAddress());

  // Save contract address to a JSON file
  const contractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contract');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, 'contract-address.json'),
    JSON.stringify({ MonopolyNFT: await monopolyNFT.getAddress() }, undefined, 2)
  );
  console.log(
    "Adresse du contrat MonopolyNFT sauvegardée dans le fichier frontend/contract-address.json"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
