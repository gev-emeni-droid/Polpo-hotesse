import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';

const Dashboard = ({ tables, onCreateTable, onLogout, onArchive, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTableTitle, setNewTableTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    if (newTableTitle.trim()) {
      onCreateTable(newTableTitle.trim());
      setNewTableTitle('');
      setIsModalOpen(false);
    }
  };

  const toNum = (v) => (isFinite(Number(v)) ? Number(v) : 0);
  const formatCurrency = (n) =>
    toNum(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  // --- Compteurs basés uniquement sur table.reservations (liste du site) ---
  const getTotalCouverts = (table) => {
    const rows = Array.isArray(table.reservations) ? table.reservations : [];
    return rows.reduce(
      (acc, res) => acc + toNum(res.ad) + toNum(res.enf),
      0
    );
  };

  const getTheoreticalRevenue = (table) => {
    const rows = Array.isArray(table.reservations) ? table.reservations : [];
    const total = rows.reduce(
      (acc, res) =>
        acc +
        toNum(res.ad) * toNum(res.tarifad) +
        toNum(res.enf) * toNum(res.tarifenf),
      0
    );
    return formatCurrency(total);
  };

  const getResteAPayer = (table) => {
    const rows = Array.isArray(table.reservations) ? table.reservations : [];
    const { prix, paid } = rows.reduce(
      (acc, res) => {
        const mAd = toNum(res.ad) * toNum(res.tarifad);
        const mEnf = toNum(res.enf) * toNum(res.tarifenf);
        const total = mAd + mEnf;
        const p =
          toNum(res.cb) +
          toNum(res.amex) +
          toNum(res.espece) +
          toNum(res.cheque) +
          toNum(res.zen) +
          toNum(res.virm);
        acc.prix += total;
        acc.paid += p;
        return acc;
      },
      { prix: 0, paid: 0 }
    );
    return formatCurrency(prix - paid);
  };

  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    return tables.filter((table) =>
      table.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tables, searchQuery]);

  return (
    <>
      <Header title="Tableaux Actifs" onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center mb-8 gap-4 flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#163667] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-200 text-lg"
          >
            ➕ Créer un nouveau tableau
          </button>
          <button
            onClick={() => navigate('/archives')}
            className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 text-lg"
          >
            Accéder aux archives
          </button>
        </div>

        <div className="mb-8 px-4">
          <input
            type="text"
            placeholder="Rechercher un tableau..."
            className="w-full max-w-lg mx-auto block px-4 py-2 border border-gray-300 rounded-lg bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {tables.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">Aucun tableau actif</h3>
            <p className="text-gray-500 mt-2">
              Commencez par créer un nouveau tableau pour gérer vos réservations.
            </p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">Aucun tableau trouvé</h3>
            <p className="text-gray-500 mt-2">
              Votre recherche pour "{searchQuery}" n&apos;a retourné aucun résultat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#163667] truncate">
                    {table.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Créé le:{' '}
                    {new Date(table.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="mt-4 space-y-2 text-gray-700">
                    <p>
                      <strong>Total couverts:</strong> {getTotalCouverts(table)}
                    </p>
                    <p>
                      <strong>CA Théorique:</strong> {getTheoreticalRevenue(table)}
                    </p>
                    <p>
                      <strong>Reste à payer:</strong> {getResteAPayer(table)}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/table/${table.id}`)}
                    className="bg-[#163667] text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Ouvrir
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onArchive(table.id)}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      Archiver
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm('Supprimer définitivement ce tableau ?')
                        ) {
                          onDelete(table.id);
                        }
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold">Créer un nouveau tableau</h3>
            <p className="text-sm text-gray-600 mt-2">
              Donnez un titre à votre nouveau tableau de réservations (ex:
              &quot;Nouvel An 2026-2027&quot;).
            </p>
            <input
              type="text"
              value={newTableTitle}
              onChange={(e) => setNewTableTitle(e.target.value)}
              className="w-full mt-4 p-2 border border-gray-300 rounded-md bg-white"
              placeholder="Titre du tableau"
              autoFocus
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-[#163667] text-white rounded-md hover:bg-opacity-90"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;