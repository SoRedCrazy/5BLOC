// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
        uint256 value;
        uint256 createdAt;
        uint256 lastTransferAt; 
        address[] previousOwners;
        string documentHash;                  
        bool hasSale;
    }

    struct PropertyDetail {
        uint256 tokenId;
        PropertyInfo property;
    }
    mapping(address => bool) private admins;
    mapping(uint256 => PropertyInfo) private properties;

    address[] private adminList;

    mapping(address => uint256) private lastTransactionTime;   
    mapping(address => bool) private hasLockActive;            
    mapping(address => uint256) private lockExpirationTime;    

    uint256 public constant MAX_ASSETS_PER_ADDRESS = 4;

    uint256 private constant TRANSACTION_COOLDOWN = 5 minutes;
    uint256 private constant FIRST_PURCHASE_LOCK = 10 minutes;

    uint256 private _tokenIds;

    struct Transaction {
        uint256 tokenId;
        address from;
        address to;
        uint256 timestamp;
    }

    Transaction[] private transactions;

    constructor() ERC721("MonopolyNFT", "MNP") Ownable(msg.sender) {
        address msgSender = _msgSender();
        admins[msgSender] = true;
        adminList.push(msgSender);
    }

    /**
     * @dev Permet de mint un nouveau token.
     * @param propertyType Type de bien
     * @param name Nom du bien
     * @param location Localisation du bien
     * @param value Valeur du bien en wei
     * @param documentHash Hash du document associé
     */
    function mint(
        PropertyType propertyType,
        string memory name,
        string memory location,
        uint256 value,
        string memory documentHash
    ) external onlyOwner {
        _tokenIds++;
        uint256 tokenId = _tokenIds;

        properties[tokenId] = PropertyInfo({
            propertyType: propertyType,
            name: name,
            location: location,
            value: value,
            createdAt: block.timestamp,
            previousOwners: new address[](0),
            lastTransferAt: block.timestamp,
            documentHash: documentHash,
            hasSale: true
        });

        _safeMint(msg.sender, tokenId);
    }

    /**
     * @dev Permet de ajouter un administrateur.
     * @param account ID de l'account à ajouter
     */
    function addAdmin(address account) public onlyOwner {
        require(!admins[account], "Account is already an admin");
        admins[account] = true;
        adminList.push(account);
    }

    /**
     * @dev Permet de supprimer un administrateur.
     * @param account ID de l'account à supprimer
     */
    function removeAdmin(address account) public onlyOwner {
        require(admins[account], "Account is not an admin");
        admins[account] = false;
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == account) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }
    }

    /**
     * @dev Retourne la liste des administrateurs.
     */
    function getAllAdmins() external view returns (address[] memory) {
        return adminList;
    }

    /**
     * @dev Vérifie si une adresse est un administrateur.
     * @param account Adresse à vérifier
     * @return bool Vrai si l'adresse est un administrateur, faux sinon
     */
    function isAdmin(address account) external view returns (bool) {
        return admins[account];
    }
    
    /**
     * @dev Surcharge du _transfer d'ERC721 pour intégrer nos règles :
     *      - Mettre à jour le timestamp de la dernière transaction pour les deux parties
     *      - Mettre à jour le timestamp de la dernière transaction pour le token
     *      - Enregistrer la transaction dans l'historique
     */
    function _update(
        address from,
        address to,
        uint256 tokenId
    ) internal {
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
                getPropertiesCountAtAddress(to) < MAX_ASSETS_PER_ADDRESS,
                "L'acheteur possede deja 4 actifs a cette adresse"
            );
        }

        if (to != address(0)) {
            properties[tokenId].lastTransferAt = block.timestamp;
            
            lastTransactionTime[to] = block.timestamp;
            if (from != address(0)) {
                lastTransactionTime[from] = block.timestamp;
            }

            transactions.push(Transaction({
                tokenId: tokenId,
                from: from,
                to: to,
                timestamp: block.timestamp
            }));
        }
    }

    /**
     * @dev Surcharge du _safeTransfer d'ERC721 pour intégrer nos règles :
     *      - Mettre à jour le timestamp de la dernière transaction pour les deux parties
     *      - Mettre à jour le timestamp de la dernière transaction pour le token
     *      - Enregistrer la transaction dans l'historique
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal override {
        _update(from, to, tokenId);
        super._safeTransfer(from, to, tokenId, _data);
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

    /**
     * @dev Retourne la liste des propriétés disponibles.
     */
    function getAvailableProperties() 
        external 
        view 
        returns (PropertyDetail[] memory) 
    {
        uint256 totalProperties = _tokenIds;
        PropertyDetail[] memory allProps = new PropertyDetail[](totalProperties);

        for (uint256 i = 1; i <= totalProperties; i++) {
                allProps[i - 1] = PropertyDetail({
                    tokenId: i,
                    property: properties[i]
                });
        }
        return allProps;
    }

    /**
     * @dev Retourne la liste des propriétés possédées par l'appelant.
     */
    function getMyProperties() 
        external 
        view 
        returns (PropertyDetail[] memory) 
    {
        uint256 totalProperties = _tokenIds;
        uint256 ownedCount = balanceOf(msg.sender);
        PropertyDetail[] memory myProperties = new PropertyDetail[](ownedCount);
        uint256 counter = 0;

        for (uint256 i = 1; i <= totalProperties; i++) {
            if (ownerOf(i) == msg.sender) {
                myProperties[counter] =  PropertyDetail({
                    tokenId: i,
                    property: properties[i]
                });
                counter++;
            }
        }

        return myProperties;
    }

    /**
     * @dev Permet à un utilisateur d'acheter un bien.
     * @param tokenId ID du token à acheter
     */
    function purchaseProperty(uint256 tokenId) external payable {
        address owner = ownerOf(tokenId);
        require(owner != msg.sender, "Vous ne pouvez pas acheter votre propre bien");

        require(properties[tokenId].hasSale == true, "Ce bien n'est pas en vente");
        uint256 propertyValue = properties[tokenId].value;
        require(msg.value >= propertyValue, "Fonds insuffisants pour acheter ce bien");
        require(block.timestamp >= lastTransactionTime[msg.sender] + TRANSACTION_COOLDOWN, "Cooldown actif pour l'acheteur");

        payable(owner).transfer(propertyValue);

        _safeTransfer(owner, msg.sender, tokenId, "");

        if (msg.value > propertyValue) {
            payable(msg.sender).transfer(msg.value - propertyValue);
        }

        properties[tokenId].previousOwners.push(owner);
        properties[tokenId].hasSale = false;
        lastTransactionTime[msg.sender] = block.timestamp;
        hasLockActive[msg.sender] = true;
        lockExpirationTime[msg.sender] = block.timestamp + FIRST_PURCHASE_LOCK;
    }

    /**
     * @dev Permet d'échanger des maisons contre une gare ou un hôtel.
     * @param houseTokenIds IDs des tokens des maisons à échanger
     * @param targetType Type de bien cible (gare ou hôtel)
     */
    function exchangeHousesForProperty(uint256[] calldata houseTokenIds, PropertyType targetType) external {
        require(targetType == PropertyType.GARE || targetType == PropertyType.HOTEL, "Le type cible doit etre une gare ou un hotel");
        require(houseTokenIds.length == 3 || houseTokenIds.length == 4, "Nombre incorrect de maisons pour l'echange");

        if (targetType == PropertyType.GARE) {
            require(houseTokenIds.length == 3, "3 maisons sont necessaires pour echanger contre une gare");
        } else if (targetType == PropertyType.HOTEL) {
            require(houseTokenIds.length == 4, "4 maisons sont necessaires pour echanger contre un hotel");
        }

        string memory location = properties[houseTokenIds[0]].location;
        uint256 totalValue = 0;

        uint256 length = houseTokenIds.length;
        for (uint256 i = 0; i < length; i++) {
            uint256 houseTokenId = houseTokenIds[i];
            require(ownerOf(houseTokenId) == msg.sender, "Vous devez posseder toutes les maisons pour l'echange");
            require(properties[houseTokenId].propertyType == PropertyType.MAISON, "Tous les tokens doivent etre des maisons");
            require(keccak256(bytes(properties[houseTokenId].location)) == keccak256(bytes(location)), "Toutes les maisons doivent avoir la meme adresse");

            totalValue += properties[houseTokenId].value;

            _burn(houseTokenId);
        }

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        properties[newTokenId] = PropertyInfo({
            propertyType: targetType,
            name: targetType == PropertyType.GARE ? "Gare" : "Hotel",
            location: location,
            value: totalValue,
            createdAt: block.timestamp,
            previousOwners: new address[](0),
            lastTransferAt: block.timestamp,
            documentHash: "",
            hasSale: false
        });

        _safeMint(msg.sender, newTokenId);
    }

    /**
     * @dev Retourne l'historique des transactions.
     */
    function getTransactionHistory() external view returns (Transaction[] memory) {
        return transactions;
    }

    /**
     * @dev Recherche des propriétés par type.
     * @param propertyType Type de bien à rechercher
     * @return Liste des propriétés correspondant au type
     */
    function searchPropertiesByType(PropertyType propertyType) external view returns (PropertyDetail[] memory) {
        uint256 totalProperties = _tokenIds;
        uint256 counter = 0;

        for (uint256 i = 1; i <= totalProperties; i++) {
            if ( properties[i].propertyType == propertyType) {
                counter++;
            }
        }

        PropertyDetail[] memory result = new PropertyDetail[](counter);
        counter = 0;

        for (uint256 i = 1; i <= totalProperties; i++) {
            if (properties[i].propertyType == propertyType) {
                result[counter] = PropertyDetail({
                    tokenId: i,
                    property: properties[i]
                });
                counter++;
            }
        }

        return result;
    }

    /**
     * @dev Filtre les propriétés par valeur.
     * @param minValue Valeur minimale en wei
     * @param maxValue Valeur maximale en wei
     * @return Liste des propriétés correspondant aux critères de valeur
     */
    function filterPropertiesByValue(uint256 minValue, uint256 maxValue) external view returns (PropertyDetail[] memory) {
        uint256 totalProperties = _tokenIds;
        uint256 counter = 0;

        for (uint256 i = 1; i <= totalProperties; i++) {
            uint256 value = properties[i].value;
            if (value >= minValue && value <= maxValue) {
                counter++;
            }
        }

        PropertyDetail[] memory result = new PropertyDetail[](counter);
        counter = 0;

        for (uint256 i = 1; i <= totalProperties; i++) {
            uint256 value = properties[i].value;
            if (value >= minValue && value <= maxValue) {
                result[counter] = PropertyDetail({
                    tokenId: i,
                    property: properties[i]
                });
                counter++;
            }
        }

        return result;
    }

    /**
     * @dev Retourne le nombre de propriétés à une adresse donnée.
     * @param owner Adresse à vérifier
     * @return Nombre de propriétés à l'adresse
     */
    function getPropertiesCountAtAddress(address owner) internal view returns (uint256) {
        uint256 totalProperties = _tokenIds;
        uint256 count = 0;

        for (uint256 i = 1; i <= totalProperties; i++) {
            if (ownerOf(i) == owner) {
                count++;
            }
        }

        return count;
    }

    /**
     * @dev Permet de mettre une propriété en vente ou de retirer une propriété de la vente.
     * @param tokenId ID du token à mettre en vente ou à retirer de la vente
     * @return bool Indique si l'opération a réussi
     */
    function setPropertyOnSale(uint256 tokenId) external returns (bool) {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        properties[tokenId].hasSale = !properties[tokenId].hasSale;
        return true;
    }

}
