import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import PropertiesTable from './components/PropertiesTable';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import Transactions from './components/Transactions';
import MyAccount from './components/MyAccount';
import './App.css';
import { isAdmin } from './contract/contract';

function App() {
  const [account, setAccount] = useState(null);
  const [isAdminStatus, setIsAdminStatus] = useState(false);
  const [signer, setSigner] = useState(null);
  const [view, setView] = useState('properties');
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 10000);
  };

  const handleConnect = async (signer) => {
    try {
      const address = await signer.getAddress();
      console.log("Connecté avec l'adresse:", address);
      setAccount(address);
      setIsAdminStatus(await isAdmin(address));
      showNotification("Connecté avec l'adresse: " + address);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      showNotification("Erreur de connexion: " + error.message);
    }
  };

  const handleLogin = async (signer) => {
    setSigner(signer);
    await handleConnect(signer);
  };

  const renderView = () => {
    switch (view) {
      case 'account':
        return <MyAccount />;
      case 'admin':
        return <AdminPanel />;
      case 'transactions':
        return <Transactions />;
      default:
        return <PropertiesTable />;
    }
  };

  return (
    <div className="App">
      {notification && <div className="notification">{notification}</div>}
      {!signer ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Header account={account} isAdmin={isAdminStatus} setView={setView} />
          {renderView()}
        </>
      )}
    </div>
  );
}

export default App;
