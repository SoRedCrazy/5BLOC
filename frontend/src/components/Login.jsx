import React, { useState } from 'react';
import { connectWallet } from '../contract/contract';

const Login = ({ onLogin }) => {
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      const signer = await connectWallet();
      if (signer) {
        onLogin(signer);
      } else {
        setError("Connexion échouée. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Erreur lors de la connexion: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <button onClick={handleLogin}>Se connecter avec MetaMask</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
