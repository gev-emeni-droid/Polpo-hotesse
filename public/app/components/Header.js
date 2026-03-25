import React from 'react';
import { LOGO_BASE64 } from '../constants.js';

const Header = ({ title, onLogout }) => {
  return (
    <header className="relative py-4 px-4 bg-gray-50">
        <img 
            className="fixed top-5 left-6 h-28 w-auto object-contain z-50 hidden md:block" 
            src={LOGO_BASE64} 
            alt="Polpo Brasserie Seafood logo"
        />
        <div className="absolute left-0 right-0 top-2 text-center">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide text-[#163667]">
                {title}
            </h1>
        </div>
        <button
            onClick={onLogout}
            className="fixed top-2 right-2 md:top-2.5 md:right-2.5 z-50 bg-[#163667] text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
        >
            Déconnexion
        </button>
    </header>
  );
};

export default Header;
