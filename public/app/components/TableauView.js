import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header.js';
import ReservationModal from './ReservationModal.js';
import SettingsModal from './SettingsModal.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const formatCurrency = (value) => {
  const num = Number(String(value || '0').replace(',', '.'));
  return isFinite(num) ? num.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '0,00 €';
};

const SortableHeader = ({ label, sortKey, sortConfig, requestSort }) => {
  const sortIndicator = sortConfig && sortConfig.key === sortKey ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '';
  return (
    <th scope="col" className="px-2 py-3 whitespace-nowrap th-sortable" onClick={() => requestSort(sortKey)}>
      {label} <span className="sort-indicator">{sortIndicator}</span>
    </th>
  );
};

const KPI = ({ label, value }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-bold text-[#163667] mt-1">{value}</div>
  </div>
);

const TableauView = ({ allTables, updateTable, onLogout, updateTableTitle }) => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const currentTable = useMemo(() => allTables.find(t => t.id === tableId), [allTables, tableId]);

  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);
  const [priseParOptions, setPriseParOptions] = useLocalStorage('priseParOptions_v1', ['Emeni', 'Alexandre', 'Camille']);
  const [encaisserParOptions, setEncaisserParOptions] = useLocalStorage('encaisserParOptions_v1', ['Emeni', 'Alexandre', 'Camille', 'Manager']);

  useEffect(() => {
    if (!currentTable) {
      navigate('/');
      return;
    }
    document.title = currentTable.title;
    (async () => {
      try {
        const res = await fetch(`/api/tables/${encodeURIComponent(currentTable.id)}`);
        if (res.ok) {
          const data = await res.json();
          const rows = Array.isArray(data.rows) ? data.rows : [];

          // Normaliser + dédupliquer les réservations par id pour éviter les doublons
          const mapped = rows.map((r) => ({ id: r.id, ...Object(r) }));
          const seen = new Set();
          const unique = [];
          for (const row of mapped) {
            if (row.id == null) {
              unique.push(row);
              continue;
            }
            if (seen.has(row.id)) continue;
            seen.add(row.id);
            unique.push(row);
          }

          setReservations(unique);
        } else {
          setReservations(currentTable.reservations || []);
        }
      } catch (e) {
        setReservations(currentTable.reservations || []);
      }
    })();
  }, [currentTable, navigate]);

  const filteredReservations = useMemo(() => {
    if (!searchQuery) return reservations;
    const lowercasedQuery = searchQuery.toLowerCase();
    return reservations.filter(res => (
      Object.values(res).some(value => String(value).toLowerCase().includes(lowercasedQuery))
    ));
  }, [reservations, searchQuery]);

  const sortedReservations = useMemo(() => {
    let sortableItems = [...filteredReservations];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const getSortableValue = (item, key) => {
          switch (key) {
            case 'cvt': return (item.ad || 0) + (item.enf || 0);
            case 'montantAd': return (item.ad || 0) * (item.tarifad || 0);
            case 'montantEnf': return (item.enf || 0) * (item.tarifenf || 0);
            case 'prixTotal': return ((item.ad || 0) * (item.tarifad || 0)) + ((item.enf || 0) * (item.tarifenf || 0));
            case 'reste': {
              const total = ((item.ad || 0) * (item.tarifad || 0)) + ((item.enf || 0) * (item.tarifenf || 0));
              const paid = (item.cb || 0) + (item.amex || 0) + (item.espece || 0) + (item.cheque || 0) + (item.zen || 0) + (item.virm || 0);
              return total - paid;
            }
            default: return item[key];
          }
        };
        const valA = getSortableValue(a, sortConfig.key);
        const valB = getSortableValue(b, sortConfig.key);
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA < valB ? -1 : 1) * (sortConfig.direction === 'ascending' ? 1 : -1);
        }
        return String(valA).localeCompare(String(valB), 'fr', { numeric: true }) * (sortConfig.direction === 'ascending' ? 1 : -1);
      });
    }
    return sortableItems;
  }, [filteredReservations, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

const handleSaveReservation = useCallback(async (reservation) => {
  console.log('[TableauView.jsx] handleSaveReservation', reservation);
  if (!currentTable) return;
  let saved = { ...reservation };
  try {
    if (reservation.id && reservations.find(r => r.id === reservation.id)) {
      console.log('PATCH /api/rows/', reservation.id);
      await fetch(`/api/rows/${encodeURIComponent(reservation.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: reservation })
      });
    } else {
      console.log('POST /api/tables/', currentTable.id, '/rows');
      const res = await fetch(`/api/tables/${encodeURIComponent(currentTable.id)}/rows`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: reservation })
      });
      if (res.ok) {
        const data = await res.json();
        saved.id = data.id || saved.id;
      }
    }
  } catch (e) {
    console.error('[TableauView.jsx] save error', e);
  }

  // Upsert robuste par id : on enlève d’abord toute réservation avec ce même id,
  // puis on ajoute la version à jour pour éviter les doublons.
  const updated = [
    ...reservations.filter((r) => r.id !== saved.id),
    saved,
  ];

  setReservations(updated);
  updateTable(currentTable.id, updated);
  console.log('[After save] reservations =', updated);
}, [reservations, currentTable, updateTable]);

  const handleDeleteReservation = useCallback(async (reservationId) => {
    if (!currentTable) return;
    if (window.confirm('Supprimer cette réservation ?')) {
      try { await fetch(`/api/rows/${encodeURIComponent(reservationId)}`, { method: 'DELETE' }); } catch (e) {}
      const updatedReservations = reservations.filter(r => r.id !== reservationId);
      setReservations(updatedReservations);
      updateTable(currentTable.id, updatedReservations);
      console.log('[After delete] reservations =', updatedReservations);
    }
  }, [reservations, currentTable, updateTable]);

  const handleDeleteAll = async () => {
    if (!currentTable) return;
    if (window.confirm(`Supprimer TOUTES les données du tableau "${currentTable?.title}" ? Cette action est irréversible.`)) {
      try { await Promise.all(reservations.map(r => fetch(`/api/rows/${encodeURIComponent(r.id)}`, { method: 'DELETE' }))); } catch (e) {}
      setReservations([]);
      updateTable(currentTable.id, []);
    }
  };

  const totals = useMemo(() => {
    return sortedReservations.reduce((acc, res) => {
      const mAd = (res.ad || 0) * (res.tarifad || 0);
      const mEnf = (res.enf || 0) * (res.tarifenf || 0);
      acc.ad += res.ad || 0;
      acc.enf += res.enf || 0;
      acc.cvt += (res.ad || 0) + (res.enf || 0);
      acc.mAd += mAd;
      acc.mEnf += mEnf;
      acc.prix += mAd + mEnf;
      acc.cb += res.cb || 0;
      acc.amex += res.amex || 0;
      acc.espece += res.espece || 0;
      acc.cheque += res.cheque || 0;
      acc.zen += res.zen || 0;
      acc.virm += res.virm || 0;
      return acc;
    }, { ad: 0, enf: 0, cvt: 0, mAd: 0, mEnf: 0, prix: 0, cb: 0, amex: 0, espece: 0, cheque: 0, zen: 0, virm: 0 });
  }, [sortedReservations]);

  const totalPaid = totals.cb + totals.amex + totals.espece + totals.cheque + totals.zen + totals.virm;
  const totalReste = totals.prix - totalPaid;

  const tableWrapperRef = useRef(null);
  const scrollTrackRef = useRef(null);
  const scrollThumbRef = useRef(null);

  useEffect(() => {
    const tableWrapper = tableWrapperRef.current;
    const scrollTrack = scrollTrackRef.current;
    const scrollThumb = scrollThumbRef.current;
    if (!tableWrapper || !scrollTrack || !scrollThumb) return;

    const handleScroll = () => {
      const scrollWidth = tableWrapper.scrollWidth;
      const clientWidth = tableWrapper.clientWidth;
      const thumbWidthRatio = clientWidth / scrollWidth;
      const thumbWidth = Math.max(40, Math.floor((scrollTrack.clientWidth - 4) * thumbWidthRatio));
      scrollThumb.style.width = `${thumbWidth}px`;
      const maxScrollLeft = scrollWidth - clientWidth;
      const scrollRatio = maxScrollLeft ? tableWrapper.scrollLeft / maxScrollLeft : 0;
      const maxThumbLeft = scrollTrack.clientWidth - 4 - thumbWidth;
      scrollThumb.style.left = `${2 + Math.floor(maxThumbLeft * scrollRatio)}px`;
    };

    handleScroll();
    tableWrapper.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    let isDragging = false;
    let startX = 0;
    let startLeft = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX;
      startLeft = parseInt(scrollThumb.style.left || '2');
      scrollThumb.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const handleMouseUp = () => {
      isDragging = false;
      scrollThumb.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const thumbWidth = scrollThumb.offsetWidth;
      const maxThumbLeft = scrollTrack.clientWidth - 4 - thumbWidth;
      const newLeft = Math.max(2, Math.min(2 + maxThumbLeft, startLeft + dx));
      scrollThumb.style.left = `${newLeft}px`;
      const scrollRatio = (newLeft - 2) / maxThumbLeft;
      const maxScrollLeft = tableWrapper.scrollWidth - tableWrapper.clientWidth;
      tableWrapper.scrollLeft = Math.floor(maxScrollLeft * scrollRatio);
    };

    scrollThumb.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      tableWrapper.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      scrollThumb.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sortedReservations]);

  if (!currentTable) {
    return <div className="p-8 text-center">Chargement ou tableau non trouvé...</div>;
  }

  const tableHeaders = [
    { label: 'NOM', key: 'nom' },
    { label: 'PRÉNOM', key: 'prenom' },
    { label: 'TÉLÉPHONE', key: 'tel' },
    { label: 'HEURE', key: 'heure' },
    { label: 'DATE CRÉATION', key: 'creation' },
    { label: 'DATE PAIEMENT', key: 'paiement' },
    { label: 'AD.', key: 'ad' },
    { label: 'ENF.', key: 'enf' },
    { label: 'CVT.', key: 'cvt' },
    { label: 'TARIF AD.', key: 'tarifad' },
    { label: 'TARIF ENF.', key: 'tarifenf' },
    { label: 'MONTANT AD.', key: 'montantAd' },
    { label: 'MONTANT ENF.', key: 'montantEnf' },
    { label: 'PRIX TOTAL', key: 'prixTotal' },
    { label: 'CB', key: 'cb' },
    { label: 'AMEX', key: 'amex' },
    { label: 'ESPECE', key: 'espece' },
    { label: 'CHEQUE', key: 'cheque' },
    { label: 'ZEN', key: 'zen' },
    { label: 'VIRM', key: 'virm' },
    { label: 'RESTE À PAYER', key: 'reste' },
    { label: 'PRISE PAR', key: 'prisepar' },
    { label: 'ENCAISSER PAR', key: 'encaisserpar' },
    { label: 'COMMENTAIRE', key: 'comment' },
    { label: 'ACTION', key: 'action' }
  ];

  const printTable = () => {
    document.body.classList.add('print-table-only');
    window.print();
    document.body.classList.remove('print-table-only');
  };

  const handleAddReservation = () => {
    setEditingReservation(null);
    setIsModalOpen(true);
  };

  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setIsModalOpen(true);
  };

  return (
    <>
      <Header title={currentTable.title} onLogout={onLogout} />
      <main className="max-w-screen-2xl mx-auto px-2">
        <div className="mb-4 text-center back-link">
          <button onClick={() => navigate('/')} className="text-sm text-[#163667] hover:underline">← Retour à la liste des tableaux</button>
        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-4 mb-4 panel-controls">
          <div className="flex justify-center mb-4">
            <input id="global-search" placeholder="Rechercher une réservation (Nom, téléphone, etc.)" className="w-full md:w-1/2 lg:w-1/3 px-4 py-2 border border-gray-300 rounded-lg bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {currentTable.isActive && (
              <button className="bg-[#163667] text-white font-semibold py-2 px-5 rounded-lg hover:bg-opacity-90" onClick={handleAddReservation}>➕ Nouvelle réservation</button>
            )}
            <div className="menu-wrap">
              <button className="btn-more" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-haspopup="true" aria-expanded={isMenuOpen}>⋯</button>
              {isMenuOpen && (
                <div className="menu-panel open">
                  <button className="menu-item" onClick={() => { /* exporter excel */ setIsMenuOpen(!isMenuOpen); }}>Exporter Excel</button>
                  <button className="menu-item" onClick={() => { printTable(); setIsMenuOpen(!isMenuOpen); }}>Exporter PDF / Imprimer</button>
                  <div className="menu-sep"></div>
                  <button className="menu-item" onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(!isMenuOpen); }}>Paramètres</button>
                  {currentTable.isActive && (
                    <>
                      <div className="menu-sep"></div>
                      <button className="menu-item danger" onClick={() => { handleDeleteAll(); setIsMenuOpen(!isMenuOpen); }}>Supprimer les données</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 kpis">
          <KPI label="Total couverts" value={totals.cvt.toString()} />
          <KPI label="Total encaissements" value={formatCurrency(totalPaid)} />
          <KPI label="Total CA théorique" value={formatCurrency(totals.prix)} />
          <KPI label="Total reste à payer" value={formatCurrency(totalReste)} />
        </section>

        <section id="print-panel" className="bg-white border border-gray-200 rounded-xl p-1 md:p-4">
          <div className="table-wrap" ref={tableWrapperRef}>
            <table className="w-full text-xs text-left" style={{ minWidth: '2800px' }}>
              <thead className="text-xs text-gray-700 uppercase bg-indigo-100">
                <tr>
                  {tableHeaders.map(header => (
                    header.key === 'action'
                      ? <th key={header.key} scope="col" className="px-2 py-3">{header.label}</th>
                      : <SortableHeader key={header.key} label={header.label} sortKey={header.key} sortConfig={sortConfig} requestSort={requestSort} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedReservations.map(res => {
                  const montantAd = res.ad * res.tarifad;
                  const montantEnf = res.enf * res.tarifenf;
                  const prixTotal = montantAd + montantEnf;
                  const totalPaye = res.cb + res.amex + res.espece + res.cheque + res.zen + res.virm;
                  const resteAPayer = prixTotal - totalPaye;
                  return (
                    <tr key={res.id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap">{res.nom?.toUpperCase()}</td>
                      <td className="px-2 py-2 capitalize">{(res.prenom || '').toLowerCase()}</td>
                      <td className="px-2 py-2">{res.tel}</td>
                      <td className="px-2 py-2">{res.heure}</td>
                      <td className="px-2 py-2">{(res.creation || '').split('-').reverse().join('/')}</td>
                      <td className="px-2 py-2">{(res.paiement || '').split('-').reverse().join('/')}</td>
                      <td className="px-2 py-2 text-center">{res.ad}</td>
                      <td className="px-2 py-2 text-center">{res.enf}</td>
                      <td className="px-2 py-2 text-center">{(res.ad || 0) + (res.enf || 0)}</td>
                      <td className="px-2 py-2">{formatCurrency(res.tarifad)}</td>
                      <td className="px-2 py-2">{formatCurrency(res.tarifenf)}</td>
                      <td className="px-2 py-2">{formatCurrency(montantAd)}</td>
                      <td className="px-2 py-2">{formatCurrency(montantEnf)}</td>
                      <td className="px-2 py-2 font-semibold">{formatCurrency(prixTotal)}</td>
                      <td className="px-2 py-2">{formatCurrency(res.cb)}</td>
                      <td className="px-2 py-2">{formatCurrency(res.amex)}</td>
                      <td className="px-2 py-2">{formatCurrency(res.espece)}</td>
                      <td className="px-2 py-2">{formatCurrency(res.cheque)}</td>
                      <td className="px-2 py-2">{formatCurrency(res.zen)}</td>
                      <td className="px-2 py-2">{formatCurrency(res.virm)}</td>
                      <td className={`px-2 py-2 font-bold whitespace-nowrap ${resteAPayer > 0 ? 'text-red-600' : 'text-green-600'}`} data-sort={resteAPayer}>{formatCurrency(resteAPayer)}</td>
                      <td className="px-2 py-2">{res.prisepar}</td>
                      <td className="px-2 py-2">{res.encaisserpar}</td>
                      <td className="px-2 py-2 max-w-xs truncate">{res.comment}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button className="font-medium text-blue-600 hover:underline mr-3" onClick={() => handleEditReservation(res)}>✏️</button>
                        {currentTable.isActive && <button className="font-medium text-red-600 hover:underline" onClick={() => handleDeleteReservation(res.id)}>🗑️</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="font-bold bg-green-100 text-sm">
                <tr className="totals-row">
                  <td className="px-2 py-3 text-green-800">Totaux (filtrés):</td>
                  <td colSpan={5}></td>
                  <td className="px-2 py-3 text-center">{totals.ad}</td>
                  <td className="px-2 py-3 text-center">{totals.enf}</td>
                  <td className="px-2 py-3 text-center">{totals.cvt}</td>
                  <td></td>
                  <td></td>
                  <td className="px-2 py-3">{formatCurrency(totals.mAd)}</td>
                  <td className="px-2 py-3">{formatCurrency(totals.mEnf)}</td>
                  <td className="px-2 py-3">{formatCurrency(totals.prix)}</td>
                  <td className="px-2 py-3">{formatCurrency(totals.cb)}</td>
                  <td className="px-2 py-3">{formatCurrency(totals.amex)}</td>
                  <td className="px-2 py-3">{formatCurrency(totals.espece)}</td>
                  <td className="px-2 py-3">{formatCurrency(totals.cheque)}</td>
                  <td className="px-2 py-3">{formatCurrency(totals.zen)}</td>
                  <td className="px-2 py-3">{formatCurrency(totals.virm)}</td>
                  <td className="px-2 py-3">{formatCurrency(totalReste)}</td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="hscroll" id="hscroll" aria-hidden="true" ref={scrollTrackRef}>
            <div className="thumb" id="hthumb" ref={scrollThumbRef}></div>
          </div>
        </section>

        <div className="detail mt-4 p-3 rounded-lg bg-blue-100 border border-blue-200 text-blue-800 text-center text-sm" id="detail-encaiss">
          Détail des encaissements (filtrés) : CB: {formatCurrency(totals.cb)} • AMEX: {formatCurrency(totals.amex)} • ESPECE: {formatCurrency(totals.espece)} • CHEQUE: {formatCurrency(totals.cheque)} • ZEN: {formatCurrency(totals.zen)} • VIRM: {formatCurrency(totals.virm)}
        </div>

        {currentTable.isActive && <button id="fab-add" aria-label="Ajouter une réservation" onClick={handleAddReservation}>+</button>}

        {isModalOpen && (
          <ReservationModal
            reservation={editingReservation}
            onSave={handleSaveReservation}
            onClose={() => setIsModalOpen(false)}
            isArchived={!currentTable.isActive}
            priseParOptions={priseParOptions}
            encaisserParOptions={encaisserParOptions}
          />
        )}
        {isSettingsOpen && currentTable && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
            prisePar={priseParOptions}
            setPrisePar={setPriseParOptions}
            encaisserPar={encaisserParOptions}
            setEncaisserPar={setEncaisserParOptions}
            currentTitle={currentTable.title}
            onSaveTitle={(title) => updateTableTitle(currentTable.id, title)}
          />
        )}
      </main>
    </>
  );
};

export default TableauView;
