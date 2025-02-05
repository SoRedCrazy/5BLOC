import React, { useEffect, useState } from 'react';
import { getMyProperties } from '../contract/contract';

const MyAccount = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p>Chargement des propriétés...</p>;
  }

  return (
    <div>
      <h2>Mes Propriétés</h2>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyAccount;
