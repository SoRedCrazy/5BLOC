require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      },
      viaIR: true
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    },
    sepolia: {
      url: process.env.QUICKNODE_URL, 
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: "auto",
      gas: 1500000, 
      gasMultiplier: 1.1         
    },
  },
};
