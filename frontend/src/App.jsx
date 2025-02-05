import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import PropertiesTable from './components/PropertiesTable';
import Header from './components/Header';
import './App.css';
import { isAdmin } from './contract/contract';

function App() {
  const [account, setAccount] = useState(null);
  const [isAdminStatus, setIsAdminStatus] = useState(false);
  const [signer, setSigner] = useState(null);

  const handleConnect = async (signer) => {
    try {
      const address = await signer.getAddress();
      console.log("Connecté avec l'adresse:", address);
      setAccount(address);
      setIsAdminStatus(await isAdmin(address));
    } catch (error) {
      console.error("Erreur de connexion:", error);
    }
  };

  const handleLogin = async (signer) => {
    setSigner(signer);
    await handleConnect(signer);
  };

  return (
    <div className="App">
      {!signer ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Header account={account} isAdmin={isAdminStatus} />
          <PropertiesTable />
        </>
      )}
    </div>
  );
}

export default App;
