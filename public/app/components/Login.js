import React, { useState } from 'react';
import { LOGO_BASE64 } from '../constants.js';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'polpo.managers' && password === 'Polpo2025++') {
      setError(false);
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] p-6">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-5 shadow-lg">
        <img className="block mx-auto mb-2 w-36 h-auto" src={LOGO_BASE64} alt="Polpo Brasserie Seafood" />
        <h2 className="text-2xl font-bold text-center text-[#163667]">Connexion</h2>
        <p className="text-center text-sm text-gray-500 mt-2">Accès privé — pour obtenir vos identifiants de connexion, veuillez contacter Emeni.</p>
        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <label htmlFor="login-user" className="block text-xs text-gray-700 mb-1">Identifiant</label>
            <input id="login-user" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Identifiant" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" autoComplete="username" />
          </div>
          <div className="mt-3">
            <label htmlFor="login-pass" className="block text-xs text-gray-700 mb-1">Mot de passe</label>
            <input id="login-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" autoComplete="current-password" />
          </div>
          <button type="submit" className="w-full mt-4 py-3 border-none rounded-lg bg-[#163667] text-white font-bold cursor-pointer hover:bg-opacity-90">Se connecter</button>
          {error && <div className="text-red-700 text-xs mt-2 text-center">Identifiant ou mot de passe invalide.</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
