import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';

const Archives = ({ tables, onUnarchive, onLogout, onDelete }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const getReservationCount = (table) => table.reservations.length;
  const getTheoreticalRevenue = (table) => {
    const total = table.reservations.reduce((acc, res) => acc + (res.ad * res.tarifad) + (res.enf * res.tarifenf), 0);
    return total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    return tables.filter(table => table.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tables, searchQuery]);

  return (
    <>
      <Header title="Tableaux Archivés" onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center mb-8">
          <button onClick={() => navigate('/')} className="bg-[#163667] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-200 text-lg">← Retour aux tableaux actifs</button>
        </div>

        <div className="mb-8 px-4">
          <input type="text" placeholder="Rechercher un tableau archivé..." className="w-full max-w-lg mx-auto block px-4 py-2 border border-gray-300 rounded-lg bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {tables.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">Aucun tableau archivé</h3>
            <p className="text-gray-500 mt-2">Vous pouvez archiver des tableaux depuis la page principale.</p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">Aucun tableau archivé trouvé</h3>
            <p className="text-gray-500 mt-2">Votre recherche pour "{searchQuery}" n'a retourné aucun résultat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map(table => (
              <div key={table.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-700 truncate">{table.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Créé le: {new Date(table.createdAt).toLocaleDateString('fr-FR')}</p>
                  <div className="mt-4 space-y-2 text-gray-600">
                    <p><strong>Réservations:</strong> {getReservationCount(table)}</p>
                    <p><strong>CA Théorique:</strong> {getTheoreticalRevenue(table)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <button onClick={() => navigate(`/table/${table.id}`)} className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">Consulter</button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => onUnarchive(table.id)} className="text-sm font-medium text-[#163667] hover:underline">Désarchiver</button>
                    <button onClick={() => { if (window.confirm('Supprimer définitivement ce tableau ?')) onDelete(table.id); }} className="text-sm font-medium text-red-600 hover:text-red-800">Supprimer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default Archives;
