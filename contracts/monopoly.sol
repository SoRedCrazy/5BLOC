// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MonopolyNFT
 * @dev Contrat de NFT pour un jeu de Monopoly.
 */
contract MonopolyNFT is ERC721, Ownable {

    enum PropertyType { MAISON, GARE, HOTEL }

    struct PropertyInfo {
        PropertyType propertyType;
        string name;
        string location;
        string value;
        string surface;
        uint256 createdAt;
        uint256 lastTransferAt; 
        string documentHash;       
        string imageHash;           
    }

    mapping(uint256 => PropertyInfo) public properties;


    mapping(address => uint256) public lastTransactionTime;   
    mapping(address => bool) public hasLockActive;            
    mapping(address => uint256) public lockExpirationTime;    


    uint256 public constant MAX_ASSETS_PER_ADDRESS = 4;

    uint256 public constant TRANSACTION_COOLDOWN = 5 minutes;
    uint256 public constant FIRST_PURCHASE_LOCK = 10 minutes;

    uint256 private _tokenIds;

    constructor() ERC721("MonopolyNFT", "MNP") {}

    /**
     * @dev Permet de minter un nouveau bien (par exemple, un administrateur ou un "maire").
     *      Dans un cas réel, cette fonction pourrait être restreinte (onlyOwner, etc.)
     * @param _to Adresse destinataire
     * @param _propertyType Type de propriété (0=MAISON,1=GARE,2=HOTEL)
     * @param _documentHash Hash IPFS du document
     * @param _imageHash Hash IPFS de l'image
     */
    function mintProperty(
        address _to,
        PropertyType _propertyType,
        string memory _documentHash,
        string memory _imageHash
    ) external onlyOwner {
        require(
            balanceOf(_to) < MAX_ASSETS_PER_ADDRESS,
            "Cette adresse possede deja le maximum d'actifs"
        );

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(_to, newTokenId);

        properties[newTokenId] = PropertyInfo({
            propertyType: _propertyType,
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            documentHash: _documentHash,
            imageHash: _imageHash
        });

        // Si c'est le premier achat de cet utilisateur, on active le lock
        if (!hasLockActive[_to]) {
            hasLockActive[_to] = true;
            lockExpirationTime[_to] = block.timestamp + FIRST_PURCHASE_LOCK;
        }

        lastTransactionTime[_to] = block.timestamp;
    }

    /**
     * @dev Permet de brûler un bien (par exemple, un administrateur ou un "maire").
     *      Dans un cas réel, cette fonction pourrait être restreinte (onlyOwner, etc.)
     * @param tokenId ID du token à brûler
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        if (from != address(0) && to != address(0)) {
            require(
                block.timestamp >= lastTransactionTime[from] + TRANSACTION_COOLDOWN,
                "Cooldown actif pour le vendeur"
            );

            if (hasLockActive[to]) {
                require(
                    block.timestamp >= lockExpirationTime[to],
                    "Lock de 10 minutes actif pour l'acheteur"
                );
            }
            require(
                balanceOf(to) < MAX_ASSETS_PER_ADDRESS,
                "L'acheteur possede deja 4 actifs"
            );
        }

        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Surcharge du _afterTokenTransfer d'ERC721 pour intégrer nos règles :
     *      - Mettre à jour le timestamp de la dernière transaction pour les deux parties
     *      - Mettre à jour le timestamp de la dernière transaction pour le token
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        if (to != address(0)) {
            properties[tokenId].lastTransferAt = block.timestamp;
            
            lastTransactionTime[to] = block.timestamp;
            if (from != address(0)) {
                lastTransactionTime[from] = block.timestamp;
            }
        }

        super._afterTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Permet de récupérer l'URI d'un token.
     * @param tokenId ID du token
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);
        return string(abi.encodePacked("ipfs://", properties[tokenId].documentHash));
    }

    /**
     * @dev Vérifie si un token a été minté.
     */
    function getPropertyInfo(uint256 tokenId) 
        external 
        view 
        returns (PropertyInfo memory) 
    {
        return properties[tokenId];
    }
}
