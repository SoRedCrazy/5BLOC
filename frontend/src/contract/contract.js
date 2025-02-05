import { ethers } from 'ethers';

const contractAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
const contractABI = [
  // Le mapping public proposals génère automatiquement cette fonction
  "function mint(uint8 propertyType, string memory name, string memory location, string memory value, string memory surface, string memory documentHash, string memory imageHash) external",
  "function addAdmin(address account) public",
  "function removeAdmin(address account) public",
  "function getPropertyInfo(uint256 tokenId) external view returns (tuple(uint8 propertyType, string name, string location, string value, string surface, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, string imageHash))",
  "function getAvailableProperties() external view returns (tuple(uint8 propertyType, string name, string location, string value, string surface, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, string imageHash)[])",
  "function getMyProperties() external view returns (tuple(uint8 propertyType, string name, string location, string value, string surface, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, string imageHash)[])",
  "function purchaseProperty(uint256 tokenId) external payable",
  "function exchangeHousesForProperty(uint256[] calldata houseTokenIds, uint8 targetType) external",
  "function getTransactionHistory() external view returns (tuple(uint256 tokenId, address from, address to, uint256 timestamp)[])",
  "function searchPropertiesByType(uint8 propertyType) external view returns (tuple(uint8 propertyType, string name, string location, string value, string surface, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, string imageHash)[])",
  "function filterPropertiesByValue(uint256 minValue, uint256 maxValue) external view returns (tuple(uint8 propertyType, string name, string location, string value, string surface, uint256 createdAt, uint256 lastTransferAt, address[] previousOwners, string documentHash, string imageHash)[])",
  "function getPropertiesCountAtAddress(address owner) public view returns (uint256)",
  "function getAllAdmins() external view returns (address[])",
  "function isAdmin(address account) external view returns (bool)"
];

let provider = null;
let signer = null;

export const connectWallet = async () => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error("MetaMask n'est pas installé");
    }

    // Vérifier si déjà connecté
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });

    if (accounts.length > 0) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      return signer;
    }

    // Si pas connecté, demander la connexion
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
  return signer ? new ethers.Contract(contractAddress, contractABI, signer) : null;
};

export const getAvailableProperties = async () => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const properties = await contract.getAvailableProperties();
    return properties.map(property => ({
      propertyType: property.propertyType,
      name: property.name,
      location: property.location,
      value: property.value,
      surface: property.surface,
      createdAt: property.createdAt,
      lastTransferAt: property.lastTransferAt,
      previousOwners: property.previousOwners,
      documentHash: property.documentHash,
      imageHash: property.imageHash
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des propriétés disponibles:", error);
    return [];
  }
};

export const mint = async (propertyType, name, location, value, surface, documentHash, imageHash) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error("Contrat non disponible");

    const tx = await contract.mint(propertyType, name, location, value, surface, documentHash, imageHash);
    await tx.wait(); // Attendre la confirmation

    return true;
  } catch (error) {
    console.error("Erreur lors du mint:", error);
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
