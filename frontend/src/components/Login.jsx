import React, { useState } from 'react';
import { connectWallet } from '../contract/contract';

const Login = ({ onLogin }) => {
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 10000);
  };

  const handleLogin = async () => {
    try {
      const signer = await connectWallet();
      if (signer) {
        onLogin(signer);
      } else {
        showNotification("Connexion échouée. Veuillez réessayer.");
      }
    } catch (err) {
      showNotification("Erreur lors de la connexion: " + err.message);
    }
  };

  return (
    <div className="login-container">
      {notification && <div className="notification">{notification}</div>}
      <h2>Connexion</h2>
      <button onClick={handleLogin}>Se connecter avec MetaMask</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
