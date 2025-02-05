import React, { useEffect, useState } from 'react';
import { getAvailableProperties, purchaseProperty } from '../contract/contract';
import { ethers } from 'ethers';

const PropertiesTable = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handlePurchase = async (tokenId, value) => {
    try {
      await purchaseProperty(tokenId, value)
      alert('Property purchased successfully');
      // Refresh properties list
      const availableProperties = await getAvailableProperties();
      setProperties(availableProperties);
    } catch (error) {
      console.error('Error purchasing property:', error);
      alert('Error purchasing property');
    }
  };

  if (loading) {
    return <p>Chargement des propriétés...</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Nom</th>
          <th>Localisation</th>
          <th>Valeur</th>
          <th>Surface</th>
          <th>Date de création</th>
          <th>Dernier transfert</th>
          <th>Document Hash</th>
          <th>Image Hash</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {properties.map((property, index) => (
          <tr key={index}>
            <td>{getPropertyType(property.propertyType)}</td>
            <td>{property.name}</td>
            <td>{property.location}</td>
            <td>{property.value}</td>
            <td>{property.surface}</td>
            <td>{new Date(property.createdAt * 1000).toLocaleString()}</td>
            <td>{new Date(property.lastTransferAt * 1000).toLocaleString()}</td>
            <td>{property.documentHash}</td>
            <td>{property.imageHash}</td>
            <td>
              <button onClick={() => handlePurchase(index, property.value)}>
                Acheter
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PropertiesTable;
