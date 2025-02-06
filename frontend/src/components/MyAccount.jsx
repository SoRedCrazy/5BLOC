import React, { useEffect, useState } from 'react';
import { getMyProperties, setSaleStatus } from '../contract/contract';
import { ethers } from 'ethers';

const MyAccount = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const myProperties = await getMyProperties();
        setProperties(myProperties);
      } catch (error) {
        console.error("Erreur lors de la récupération des propriétés:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 10000);
  };

  const handleToggleSaleStatus = async (tokenId, currentStatus) => {
    try {
      await setSaleStatus(tokenId, !currentStatus);
      showNotification('Sale status updated');
      // Refresh properties if needed
    } catch (error) {
      showNotification('Error changing sale status');
    }
  };

  const getPropertyType = (type) => {
    switch (type) {
      case 0:
        return "Maison";
      case 1:
        return "Gare";
      case 2:
        return "Hotel";
      default:
        return "Unknown";
    }
  };

  const formatValue = (value) => {
    return parseFloat(ethers.utils.formatUnits(value, 'ether')).toFixed(4);
  };

  if (loading) {
    return <p>Chargement des propriétés...</p>;
  }

  return (
    <div className="my-account-container">
      {notification && <div className="notification">{notification}</div>}
      <h2>Mes Propriétés</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Nom</th>
              <th>Localisation</th>
              <th>Valeur</th>
              <th>Date de création</th>
              <th>Dernier transfert</th>
              <th>Document Hash</th>
              <th>Previous Owners</th>
              <th>hasSale</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property, index) => (
              <tr key={index}>
                <td>{getPropertyType(property.propertyType)}</td>
                <td>{property.name}</td>
                <td>{property.location}</td>
                <td>{formatValue(property.value)}</td>
                <td>{new Date(property.createdAt * 1000).toLocaleString()}</td>
                <td>{new Date(property.lastTransferAt * 1000).toLocaleString()}</td>
                <td>{property.documentHash}</td>
                <td>{property.previousOwners.join(', ')}</td>
                <td>{property.hasSale ? "À vendre" : "Non à vendre"}</td>
                <td>
                  <button onClick={() => handleToggleSaleStatus(property.tokenId)}>
                    Changer l'état de vente
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyAccount;
