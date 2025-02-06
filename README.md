# 5BLOC

## Déployer en local

1. Assurez-vous d'avoir [Node.js](https://nodejs.org/) et [Hardhat](https://hardhat.org/) installés.
2. Clonez le dépôt et installez les dépendances :

```bash
git clone https://github.com/your-repo/5BLOC.git
cd 5BLOC
npm install
```

3. Lancez un nœud local Hardhat :

```bash
npx hardhat node
```

4. Déployez le contrat sur le réseau local :

```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Déployer sur Sepolia

1. Créez un endpoint Ethereum Sepolia sur [QuickNode](https://dashboard.quicknode.com/endpoints/440891).
2. Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```
QUICKNODE_URL="YOUR_QUICKNODE_URL"
PRIVATE_KEY="YOUR_PRIVATE_KEY"
```

3. Installez les dépendances :

```bash
npm install
```

4. Déployez le contrat sur Sepolia :

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Lancer le front

1. Assurez-vous que le contrat est déployé et que l'adresse du contrat est sauvegardée dans `frontend/src/contract/contract-address.json`.
2. Démarrez le serveur de développement :

```bash
cd frontend
npm install
npm start
```

3. Ouvrez votre navigateur et accédez à `http://localhost:3000`.

## Fonctionnalités

### Admin Panel

- Ajouter une nouvelle propriété
- Ajouter un administrateur
- Supprimer un administrateur

### Properties Table

- Afficher les propriétés disponibles
- Rechercher des propriétés par type
- Filtrer les propriétés par valeur
- Acheter une propriété

### My Account

- Afficher les propriétés possédées par l'utilisateur
- Changer l'état de vente d'une propriété

## Structure du projet

- `contracts/`: Contient les contrats intelligents Solidity.
- `scripts/`: Contient les scripts de déploiement.
- `frontend/`: Contient le code source du frontend React.

## Contribuer

Les contributions sont les bienvenues ! Veuillez soumettre une pull request ou ouvrir une issue pour discuter des changements que vous souhaitez apporter.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.