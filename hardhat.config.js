require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.QUICKNODE_URL,    // URL du noeud QuickNode
      accounts: [process.env.PRIVATE_KEY] // Clé privée de votre wallet
    },
  },
};
