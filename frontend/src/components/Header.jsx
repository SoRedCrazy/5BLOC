import React, { useState } from 'react';
import { mint } from '../contract/contract';

const Header = ({ account, isAdmin, setView }) => {
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
        <button onClick={() => setView('properties')}>Propriétés disponibles</button>
        <button onClick={() => setView('account')}>Mon compte</button>
        {isAdmin && <button onClick={() => setView('admin')}>Admin Panel</button>}
        <button onClick={() => setView('transactions')}>Transactions</button>
        </div>
    </header>
  );
};

export default Header;
