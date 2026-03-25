import React, { useState } from 'react';

const SettingsModal = ({ onClose, prisePar, setPrisePar, encaisserPar, setEncaisserPar, currentTitle, onSaveTitle }) => {
  const [priseParStr, setPriseParStr] = useState(prisePar.join(', '));
  const [encaisserParStr, setEncaisserParStr] = useState(encaisserPar.join(', '));
  const [title, setTitle] = useState(currentTitle);

  const handleSave = () => {
    setPrisePar(priseParStr.split(',').map(s => s.trim()).filter(Boolean));
    setEncaisserPar(encaisserParStr.split(',').map(s => s.trim()).filter(Boolean));
    if (title.trim() && title.trim() !== currentTitle) {
      onSaveTitle(title.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop">
      <div className="modal bg-white rounded-lg shadow-xl w-full max-w-lg">
        <header className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Paramètres du tableau</h3>
          <button onClick={onClose} className="text-2xl leading-none">&times;</button>
        </header>
        <div className="p-6 space-y-4 content">
          <div>
            <label htmlFor="table-title-input" className="block text-sm font-medium text-gray-700">Titre du tableau</label>
            <input id="table-title-input" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white" />
          </div>
          <div>
            <label htmlFor="settings-prise" className="block text-sm font-medium text-gray-700">Prénoms « Prise par » (séparés par des virgules)</label>
            <input id="settings-prise" value={priseParStr} onChange={e => setPriseParStr(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white" />
          </div>
          <div>
            <label htmlFor="settings-encaisse" className="block text-sm font-medium text-gray-700">Prénoms « Encaisser par » (séparés par des virgules)</label>
            <input id="settings-encaisse" value={encaisserParStr} onChange={e => setEncaisserParStr(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white" />
          </div>
        </div>
        <footer className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#163667] text-white rounded-md hover:bg-opacity-90">Enregistrer</button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
