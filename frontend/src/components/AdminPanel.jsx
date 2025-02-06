import React, { useState, useEffect } from 'react';
import { mint, getAllAdmins, addAdmin, removeAdmin } from '../contract/contract';

const AdminPanel = () => {
  const [propertyDetails, setPropertyDetails] = useState({
    propertyType: '',
    name: '',
    location: '',
    value: '',
    documentHash: ''
  });
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState('');
  const [adminToRemove, setAdminToRemove] = useState('');
  const [notification, setNotification] = useState(null);

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

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 10000);
  };

  const handleMint = async () => {
    try {
      await mint(
        propertyDetails.propertyType,
        propertyDetails.name,
        propertyDetails.location,
        (parseFloat(propertyDetails.value) * 100000000000000).toString(),
        propertyDetails.documentHash,
      );
      showNotification('Property minted successfully');
    } catch (error) {
      console.error('Error minting property:', error);
      showNotification('Error minting property');
    }
  };

  const handleAddAdmin = async () => {
    try {
      await addAdmin(newAdmin);
      setAdmins([...admins, newAdmin]);
      setNewAdmin('');
      showNotification('Admin added successfully');
    } catch (error) {
      console.error('Error adding admin:', error);
      showNotification('Error adding admin');
    }
  };

  const handleRemoveAdminDirect = async (address) => {
    try {
      await removeAdmin(address);
      setAdmins(admins.filter(admin => admin !== address));
      showNotification('Admin removed successfully');
    } catch (error) {
      console.error('Error removing admin:', error);
      showNotification('Error removing admin');
    }
  };

  return (
    <div className="admin-panel">
      {notification && <div className="notification">{notification}</div>}
      <h2>Admin Panel</h2>
      <div className="admin-form">
        <h3>Add New Property</h3>
        <select
          name="propertyType"
          value={propertyDetails.propertyType}
          onChange={handleInputChange}
        >
          <option value="">Select Type</option>
          <option value="0">MAISON</option>
          <option value="1">GARE</option>
          <option value="2">HOTEL</option>
        </select>
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
          type="number"
          name="value"
          placeholder="12345"
          value={propertyDetails.value}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="documentHash"
          placeholder="Document Hash"
          value={propertyDetails.documentHash}
          onChange={handleInputChange}
        />
        <button onClick={handleMint}>Create Property</button>
      </div>
      <div className="admin-management">
        <h3>Manage Admins</h3>
        <div>
          <h4>Current Admins</h4>
          <table>
            <tbody>
              {admins.map((admin, index) => (
                <tr key={index}>
                  <td>{admin}</td>
                  <td><button onClick={() => handleRemoveAdminDirect(admin)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4>Add Admin</h4>
          <input
            type="text"
            placeholder="Admin Address"
            value={newAdmin}
            onChange={(e) => setNewAdmin(e.target.value)}
            className="admin-input"
          />
          <button onClick={handleAddAdmin}>Add Admin</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
