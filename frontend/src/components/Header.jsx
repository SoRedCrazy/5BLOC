import React, { useState } from 'react';
import { mint } from '../contract/contract';

const Header = ({ account, isAdmin }) => {
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({
    propertyType: '',
    name: '',
    location: '',
    value: '',
    surface: '',
    documentHash: '',
    imageHash: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyDetails({ ...propertyDetails, [name]: value });
  };

  const handleMint = async () => {
    try {
      const propertyTypeInt = parseInt(propertyDetails.propertyType, 10);
      await mint(
        propertyTypeInt,
        propertyDetails.name,
        propertyDetails.location,
        propertyDetails.value,
        propertyDetails.surface,
        propertyDetails.documentHash,
        propertyDetails.imageHash
      );
      alert('Property minted successfully');
    } catch (error) {
      console.error('Error minting property:', error);
      alert('Error minting property');
    }
  };

  return (
    <header className="header">
      <div className="nav">
        <span>Connected: {account ? account.slice(0, 6) : 'N/A'}...</span>
        {isAdmin && (
          <button onClick={() => setShowAdminForm(!showAdminForm)}>
            {showAdminForm ? 'Hide Admin Form' : 'Show Admin Form'}
          </button>
        )}
      </div>
      {showAdminForm && (
        <div className="admin-form">
          <h2>Add New Property</h2>
          <input
            type="text"
            name="propertyType"
            placeholder="Property Type (0: MAISON, 1: GARE, 2: HOTEL)"
            value={propertyDetails.propertyType}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={propertyDetails.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={propertyDetails.location}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="value"
            placeholder="Value"
            value={propertyDetails.value}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="surface"
            placeholder="Surface"
            value={propertyDetails.surface}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="documentHash"
            placeholder="Document Hash"
            value={propertyDetails.documentHash}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="imageHash"
            placeholder="Image Hash"
            value={propertyDetails.imageHash}
            onChange={handleInputChange}
          />
          <button onClick={handleMint}>Mint Property</button>
        </div>
      )}
    </header>
  );
};

export default Header;
