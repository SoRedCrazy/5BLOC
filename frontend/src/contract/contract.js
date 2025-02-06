import { ethers } from 'ethers';
import contractAddress from './contract-address.json';

const contractABI = [
  "function mint(uint8 propertyType, string name, string location, uint256 value, string documentHash) external",
  "function addAdmin(address account) public",
  "function removeAdmin(address account) public",
  "function getPropertyInfo(uint256 tokenId) external view returns (tuple(uint8 propertyType, string name, string location, uint256 value, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, bool hasSale))",
  "function getAvailableProperties() external view returns (tuple(uint256 tokenId, tuple(uint8 propertyType, string name, string location, uint256 value, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, bool hasSale))[])",
  "function getMyProperties() external view returns (tuple(uint256 tokenId, tuple(uint8 propertyType, string name, string location, uint256 value, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, bool hasSale))[])",
  "function purchaseProperty(uint256 tokenId) external payable",
  "function exchangeHousesForProperty(uint256[] calldata houseTokenIds, uint8 targetType) external",
  "function getTransactionHistory() external view returns (tuple(uint256 tokenId, address from, address to, uint256 timestamp)[])",
  "function searchPropertiesByType(uint8 propertyType) external view returns (tuple(uint256 tokenId, tuple(uint8 propertyType, string name, string location, uint256 value, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, bool hasSale))[])",
  "function filterPropertiesByValue(uint256 minValue, uint256 maxValue) external view returns (tuple(uint256 tokenId, tuple(uint8 propertyType, string name, string location, uint256 value, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, bool hasSale))[])",
  "function getAllAdmins() external view returns (address[])",
  "function isAdmin(address account) external view returns (bool)",
  "function setPropertyOnSale(uint256 tokenId) external"
];

let provider = null;
let signer = null;

export const connectWallet = async () => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error("MetaMask n'est pas installé");
    }
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });

    if (accounts.length > 0) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      return signer;
    }

    try {
      await window.ethereum.request({ 
        method: 'eth_requestAccounts',
        params: [] 
      });
      
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      return signer;
    } catch (err) {
      if (err.code === -32002) {
        alert("Une demande de connexion est déjà en cours. Veuillez vérifier MetaMask.");
      } else {
        console.error("Erreur de connexion:", err);
      }
      return null;
    }

  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return null;
  }
};

export const getContract = async () => {
  if (!signer) {
    signer = await connectWallet();
  }
  return signer ? new ethers.Contract(contractAddress.MonopolyNFT, contractABI, signer) : null;
};

const mapProperty = (property) => ({
  tokenId: property.tokenId,
  propertyType: property[1].propertyType,
  name: property[1].name,
  location: property[1].location,
  value: property[1].value,
  createdAt: property[1].createdAt,
  lastTransferAt: property[1].lastTransferAt,
  previousOwners: property[1].previousOwners,
  documentHash: property[1].documentHash,
  hasSale: property[1].hasSale
});

const fetchProperties = async (fetchFunction, ...args) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const properties = await contract[fetchFunction](...args);
    return properties.map(mapProperty);
  } catch (error) {
    console.error(`Erreur lors de la récupération des propriétés avec ${fetchFunction}:`, error);
    return [];
  }
};

export const getAvailableProperties = async () => fetchProperties('getAvailableProperties');

export const getMyProperties = async () => fetchProperties('getMyProperties');

export const searchPropertiesByType = async (propertyType) => fetchProperties('searchPropertiesByType', propertyType);

export const filterPropertiesByValue = async (minValue, maxValue) => fetchProperties('filterPropertiesByValue', minValue, maxValue);

const toWei = (ether) => ethers.utils.parseUnits(ether.toString(), 'wei');

export const mint = async (propertyType, name, location, value, documentHash) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const tx = await contract.mint(propertyType, name, location, value, documentHash);
    await tx.wait();

    return true;
  } catch (error) {
    console.error("Erreur lors du mint:", error);
    throw error;
  }
};

export const addAdmin = async (account) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const tx = await contract.addAdmin(account);
    await tx.wait();

    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'administrateur:", error);
    throw error;
  }
};

export const removeAdmin = async (account) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const tx = await contract.removeAdmin(account);
    await tx.wait(); // Attendre la confirmation

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'administrateur:", error);
    throw error;
  }
};

export const getAllAdmins = async () => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const admins = await contract.getAllAdmins();
    return admins;
  } catch (error) {
    console.error("Erreur lors de la récupération des administrateurs:", error);
    return [];
  }
};

export const isAdmin = async (account) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const adminStatus = await contract.isAdmin(account);
    return adminStatus;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'administrateur:", error);
    return false;
  }
};

export const getTransactionHistory = async () => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const transactions = await contract.getTransactionHistory();
    return transactions.map(transaction => ({
      tokenId: transaction.tokenId.toString(),
      from: transaction.from,
      to: transaction.to,
      timestamp: transaction.timestamp.toNumber()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    return [];
  }
};

export const purchaseProperty = async (tokenId, etherValue) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const weiValue = toWei(etherValue);
    const tx = await contract.purchaseProperty(tokenId, { value: weiValue });
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Erreur lors de l'achat de la propriété:", error);
    throw error;
  }
};

export const setSaleStatus = async (tokenId) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");
    const tx = await contract.setPropertyOnSale(tokenId );
    await tx.wait();
    console.log(tx);
    return true;
  } catch (error) {
    console.error("Erreur lors du changement de l'état de vente:", error);
    throw error;
  }
};


