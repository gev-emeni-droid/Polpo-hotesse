import React from 'react';

const Header = ({ title, onLogout }) => {
  return (
    <header className="bg-gray-50 px-4 pt-1 pb-2">
      <div className="flex items-start justify-between gap-4">
        <img
          className="h-20 md:h-24 lg:h-28 w-auto object-contain"
          src="/polpo-logo.png"
          alt="Polpo Brasserie Seafood logo"
        />
        <h1 className="flex-1 text-center text-xl md:text-2xl lg:text-3xl font-extrabold tracking-wide text-[#163667] mt-2">
          {title}
        </h1>
        <button
          onClick={onLogout}
          className="bg-[#163667] text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;
