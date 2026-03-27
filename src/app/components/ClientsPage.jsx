import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLOR_PALETTES, applyTheme } from '../themes.js';

export default function ClientsPage() {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [themeLoaded, setThemeLoaded] = useState(false);
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '' = all, 'client', 'entreprise'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const themeColor = themeLoaded && selectedTheme 
    ? (COLOR_PALETTES.find(p => p.id === selectedTheme)?.primary || '#999999') 
    : '#999999';

  // Load theme from API on mount
  // Load directly from API (no localStorage) so all users see same color
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Fetch ONLY from API - no localStorage cache, no polling
        const res = await fetch('/api/hotesse/theme');
        const data = await res.json();
        console.log('ClientsPage theme API response:', data);
        if (data.ok && data.theme_id) {
          console.log('Applying theme from API:', data.theme_id);
          setSelectedTheme(data.theme_id);
          // Apply theme to CSS
          const palette = COLOR_PALETTES.find(p => p.id === data.theme_id);
          if (palette) {
            console.log('Palette found:', palette);
            applyTheme(palette);
          } else {
            console.warn('Palette not found for', data.theme_id);
          }
        }
        setThemeLoaded(true);
      } catch (e) {
        console.error('Error loading theme:', e);
        setThemeLoaded(true);
      }
    };

    loadTheme();
    // No polling - theme loaded once on mount
  }, []);

  // Fetch clients list
  useEffect(() => {
    fetchClients(1);
  }, [search, typeFilter]);

  const fetchClients = async (pageNum) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/hotesse/clients?${params}`);
      if (!response.ok) throw new Error('Failed to fetch clients');

      const data = await response.json();
      setClients(data.clients || []);
      setTotalPages(data.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`/api/hotesse/clients/${clientId}`);
      if (!response.ok) throw new Error('Failed to fetch client details');

      const data = await response.json();
      setClientDetails(data);
      setSelectedClient(clientId);
    } catch (error) {
      console.error('Error fetching client details:', error);
      alert('Erreur lors du chargement des détails du client');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch(`/api/hotesse/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      // Refresh the clients list
      fetchClients(page);
      alert('Client supprimé avec succès');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Erreur lors de la suppression du client');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/hotesse/clients/export');
      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting clients:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const downloadDocument = (doc) => {
    try {
      console.log('Downloading document:', doc);
      if (!doc.file_data) {
        console.error('Document missing file_data:', doc);
        alert('Document non disponible');
        return;
      }
      
      // Convertir base64 en blob
      const byteCharacters = atob(doc.file_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: doc.file_type || 'application/octet-stream' });
      
      // Créer lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  if (selectedClient && clientDetails) {
    return (
      <div className="p-6 bg-white rounded-lg">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedClient(null);
              setClientDetails(null);
            }}
            style={{ backgroundColor: themeColor }}
            className="px-4 py-2 text-white rounded hover:opacity-90 transition-opacity font-medium"
          >
            ← Retour à la liste
          </button>
        </div>

        <div className="mb-8 pb-6 border-b" style={{ borderColor: `${themeColor}33` }}>
          <h2 className="text-3xl font-bold mb-6" style={{ color: themeColor }}>
            {clientDetails.client.prenom} {clientDetails.client.nom}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 bg-gray-50 p-6 rounded-lg">
            <div>
              <label className="text-xs font-semibold uppercase" style={{ color: themeColor }}>Téléphone</label>
              <p className="font-medium text-gray-800 mt-1">{clientDetails.client.telephone}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase" style={{ color: themeColor }}>Mail</label>
              <p className="font-medium text-gray-800 mt-1">{clientDetails.client.mail || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase" style={{ color: themeColor }}>Entreprise</label>
              <p className="font-medium text-gray-800 mt-1">{clientDetails.client.entreprise || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold uppercase" style={{ color: themeColor }}>Adresse</label>
              <p className="font-medium text-gray-800 mt-1">{clientDetails.client.adresse_postale || '-'}</p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
          Historique des privatisations ({clientDetails.privatisations.length})
        </h3>
        
        {clientDetails.privatisations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune privatisation pour ce client</p>
        ) : (
          <div className="space-y-4">
            {clientDetails.privatisations.map((priv) => (
              <div key={priv.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow" style={{ borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="text-xs font-semibold uppercase" style={{ color: themeColor }}>Nom</label>
                    <p className="font-medium text-gray-800 mt-1">{priv.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase" style={{ color: themeColor }}>Date</label>
                    <p className="font-medium text-gray-800 mt-1">{priv.date}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase" style={{ color: themeColor }}>Personnes</label>
                    <p className="font-medium text-gray-800 mt-1">{priv.people || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase" style={{ color: themeColor }}>Période</label>
                    <p className="font-medium text-gray-800 mt-1">{priv.period}</p>
                  </div>
                </div>

                {priv.documents.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${themeColor}40` }}>
                    <label className="text-sm font-semibold text-gray-700 block mb-2" style={{ color: themeColor }}>
                      Documents ({priv.documents.length})
                    </label>
                    <div className="space-y-2">
                      {priv.documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => downloadDocument(doc)}
                          className="w-full flex items-center justify-between p-2 rounded hover:shadow-md transition-all cursor-pointer text-left"
                          style={{ backgroundColor: `${themeColor}10` }}
                        >
                          <span className="text-sm text-gray-700 font-medium">{doc.file_name}</span>
                          <span className="text-xs font-medium" style={{ color: themeColor }}>{(doc.file_size / 1024).toFixed(2)} KB</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg">
      {themeLoaded && (
      <>
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            style={{ backgroundColor: themeColor }}
            className="px-4 py-2 text-white rounded hover:opacity-90 transition-opacity font-medium"
          >
            ← Retour
          </button>
          <h1 className="text-4xl font-bold" style={{ color: themeColor }}>Fichiers Clients</h1>
        </div>
        <button
          onClick={handleExport}
          style={{ backgroundColor: themeColor }}
          className="px-4 py-2 text-white rounded hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
        >
          Exporter CSV
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom, téléphone, mail, entreprise..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-3 border-2 rounded lg focus:outline-none transition-colors"
          style={{ 
            borderColor: '#d1d5db',
            '--tw-ring-color': themeColor
          }}
          onFocus={(e) => e.target.style.borderColor = themeColor}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => { setTypeFilter(''); setPage(1); }}
          style={{
            backgroundColor: !typeFilter ? themeColor : '#e5e7eb',
            color: !typeFilter ? 'white' : '#333'
          }}
          className="px-4 py-2 rounded font-medium transition-colors hover:opacity-90"
        >
          Tous
        </button>
        <button
          onClick={() => { setTypeFilter('client'); setPage(1); }}
          style={{
            backgroundColor: typeFilter === 'client' ? themeColor : '#e5e7eb',
            color: typeFilter === 'client' ? 'white' : '#333'
          }}
          className="px-4 py-2 rounded font-medium transition-colors hover:opacity-90"
        >
          Clients
        </button>
        <button
          onClick={() => { setTypeFilter('entreprise'); setPage(1); }}
          style={{
            backgroundColor: typeFilter === 'entreprise' ? themeColor : '#e5e7eb',
            color: typeFilter === 'entreprise' ? 'white' : '#333'
          }}
          className="px-4 py-2 rounded font-medium transition-colors hover:opacity-90"
        >
          Entreprises
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Chargement...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucun client trouvé</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr style={{ backgroundColor: themeColor }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Prénom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Téléphone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Mail</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Entreprise</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Type</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-800">{client.prenom || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{client.nom}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{client.telephone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{client.mail || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{client.entreprise || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span 
                        style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {client.type === 'entreprise' ? '🏢 Entreprise' : '👤 Client'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => fetchClientDetails(client.id)}
                          style={{ backgroundColor: themeColor }}
                          className="px-3 py-1 text-white rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                          disabled={loadingDetails}
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="px-2 py-1 text-base text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                          disabled={loadingDetails}
                          title="Supprimer ce client"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: `${themeColor}08` }}>
            <p className="text-sm font-medium text-gray-700">
              Page <span style={{ color: themeColor }} className="font-bold">{page}</span> sur <span style={{ color: themeColor }} className="font-bold">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchClients(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity font-medium"
                style={{ backgroundColor: themeColor }}
              >
                ← Précédent
              </button>
              <button
                onClick={() => fetchClients(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity font-medium"
                style={{ backgroundColor: themeColor }}
              >
                Suivant →
              </button>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/hotesse')}
              className="px-4 py-2 text-white rounded hover:opacity-90 transition-opacity font-medium"
              style={{ backgroundColor: themeColor }}
            >
              ← Retour à la page précédente
            </button>
          </div>
        </>
      )}
      </>
      )}
    </div>
  );
}
