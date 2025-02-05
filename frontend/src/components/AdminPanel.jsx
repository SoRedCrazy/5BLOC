import React, { useState, useEffect } from 'react';
import { mint, getAllAdmins, addAdmin, removeAdmin } from '../contract/contract';

const AdminPanel = () => {
  const [propertyDetails, setPropertyDetails] = useState({
    propertyType: '',
    name: '',
    location: '',
    value: '',
    surface: '',
    documentHash: '',
    imageHash: ''
  });
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState('');
  const [adminToRemove, setAdminToRemove] = useState('');

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminList = await getAllAdmins();
        setAdmins(adminList);
      } catch (error) {
        console.error("Erreur lors de la récupération des administrateurs:", error);
      }
    };

    fetchAdmins();
  }, []);

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

  const handleAddAdmin = async () => {
    try {
      await addAdmin(newAdmin);
      setAdmins([...admins, newAdmin]);
      setNewAdmin('');
      alert('Admin added successfully');
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Error adding admin');
    }
  };

  const handleRemoveAdmin = async () => {
    try {
      await removeAdmin(adminToRemove);
      setAdmins(admins.filter(admin => admin !== adminToRemove));
      setAdminToRemove('');
      alert('Admin removed successfully');
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Error removing admin');
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <div className="admin-form">
        <h3>Add New Property</h3>
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
      <div className="admin-management">
        <h3>Manage Admins</h3>
        <div>
          <h4>Current Admins</h4>
          <ul>
            {admins.map((admin, index) => (
              <li key={index}>{admin}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Add Admin</h4>
          <input
            type="text"
            placeholder="Admin Address"
            value={newAdmin}
            onChange={(e) => setNewAdmin(e.target.value)}
          />
          <button onClick={handleAddAdmin}>Add Admin</button>
        </div>
        <div>
          <h4>Remove Admin</h4>
          <input
            type="text"
            placeholder="Admin Address"
            value={adminToRemove}
            onChange={(e) => setAdminToRemove(e.target.value)}
          />
          <button onClick={handleRemoveAdmin}>Remove Admin</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
