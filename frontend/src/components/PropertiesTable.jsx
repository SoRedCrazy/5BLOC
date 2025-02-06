import React, { useEffect, useState } from 'react';
import { getAvailableProperties, purchaseProperty, searchPropertiesByType, filterPropertiesByValue } from '../contract/contract';
import { ethers } from 'ethers';

const PropertiesTable = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [propertyType, setPropertyType] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const availableProperties = await getAvailableProperties();
        setProperties(availableProperties);
      } catch (error) {
        console.error("Erreur lors de la récupération des propriétés:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

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

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 10000);
  };

  const formatValue = (value) => {
    return parseFloat(ethers.utils.formatUnits(value, 'ether')).toFixed(4);
  };

  const handlePurchase = async (tokenId, propertyValue) => {
    try {
      await purchaseProperty(tokenId, propertyValue);
      showNotification('Property purchased successfully');
      const availableProperties = await getAvailableProperties();
      setProperties(availableProperties);
    } catch (error) {
      console.error('Error purchasing property:', error);
      showNotification('Error purchasing property');
    }
  };

  const handleSearchByType = async () => {
    try {
      const propertiesByType = await searchPropertiesByType(propertyType);
      setProperties(propertiesByType);
    } catch (error) {
      console.error('Error searching properties by type:', error);
      showNotification('Error searching properties by type');
    }
  };

  const handleFilterByValue = async () => {
    try {
      const filteredProperties = await filterPropertiesByValue(minValue, maxValue);
      setProperties(filteredProperties);
    } catch (error) {
      console.error('Error filtering properties by value:', error);
      showNotification('Error filtering properties by value');
    }
  };

  if (loading) {
    return <p>Chargement des propriétés...</p>;
  }

  return (
    <div className="properties-table-container">
      {notification && <div className="notification">{notification}</div>}
      <div className="search-filter-container">
        <h2>Recherche de Propriétés</h2>
        <div>
          <label>Type de propriété:</label>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="admin-input">
            <option value="">Select Type</option>
            <option value="0">Maison</option>
            <option value="1">Gare</option>
            <option value="2">Hotel</option>
          </select>
          <button onClick={handleSearchByType}>Rechercher</button>
        </div>
        <div>
          <label>Valeur Min:</label>
          <input type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)} className="admin-input" />
          <label>Valeur Max:</label>
          <input type="number" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} className="admin-input" />
          <button onClick={handleFilterByValue}>Filtrer</button>
        </div>
      </div>
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
                <td>
                  {property.hasSale ? (
                    <button onClick={() => handlePurchase(property.tokenId, property.value)}>
                      Acheter
                    </button>
                  ) : (
                    "N'est pas en vente"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertiesTable;
