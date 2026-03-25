
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import Dashboard from './components/Dashboard.js';
import Archives from './components/Archives.js';
import TableauView from './components/TableauView.js';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("auth_session_token") === "ok");
    const [tables, setTables] = useLocalStorage("all_tables_v1", []);
    const navigate = useNavigate();

    // Vérifier s'il y a un token dans l'URL lors du premier chargement
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token === 'ok') {
            localStorage.setItem("auth_session_token", "ok");
            setIsAuthenticated(true);
            // Nettoyer l'URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleLogin = useCallback(() => {
        localStorage.setItem("auth_session_token", "ok");
        setIsAuthenticated(true);
        navigate('/');
    }, [navigate]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("auth_session_token");
        setIsAuthenticated(false);
        window.location.href = 'https://polpo.connexion.l-iamani.com/';
    }, []);

    const handleCreateTable = useCallback(async (title) => {
        const name = String(title || '').trim();
        if (!name) return;
        let id = `table_${Date.now()}`;
        let createdAt = new Date().toISOString();
        try {
            const res = await fetch('/api/tables', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
            if (res.ok) {
                const data = await res.json();
                id = data.id || id;
            }
        } catch (e) {}
        const newTable = { id, title: name, isActive: true, createdAt, reservations: [] };
        setTables(prevTables => [...prevTables, newTable]);
        navigate(`/table/${newTable.id}`);
    }, [setTables, navigate]);
    
    const updateTableReservations = useCallback((tableId, reservations) => {
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, reservations } : t));
    }, [setTables]);

    const updateTableTitle = useCallback(async (tableId, title) => {
        const name = String(title || '').trim();
        if (!name) return;
        try {
            await fetch(`/api/tables/${encodeURIComponent(tableId)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
        } catch (e) {}
        setTables(prev => prev.map(t => (t.id === tableId) ? { ...t, title: name } : t));
    }, [setTables]);

    const handleToggleArchive = useCallback(async (tableId) => {
        const table = tables.find(t => t.id === tableId);
        try {
            if (table && table.isActive) {
                await fetch(`/api/tables/${encodeURIComponent(tableId)}/archive`, { method: 'POST' });
            } else {
                await fetch(`/api/tables/${encodeURIComponent(tableId)}/unarchive`, { method: 'POST' });
            }
        } catch (e) {}
        setTables(prevTables =>
            prevTables.map(t =>
                t.id === tableId ? { ...t, isActive: !t.isActive } : t
            )
        );
    }, [tables, setTables]);

    const handleDeleteTable = useCallback(async (tableId) => {
        try {
            await fetch(`/api/tables/${encodeURIComponent(tableId)}`, { method: 'DELETE' });
        } catch (e) {}
        setTables(prevTables => prevTables.filter(t => t.id !== tableId));
        if (location.pathname === `/table/${tableId}`) {
            navigate('/');
        }
    }, [setTables, navigate]);

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="*" element={<Login onLogin={handleLogin} />} />
            </Routes>
        );
    }
    
    const activeTables = tables.filter(t => t.isActive);
    const archivedTables = tables.filter(t => !t.isActive);

    useEffect(() => {
        (async () => {
            try {
                const [actRes, arcRes] = await Promise.all([
                    fetch('/api/tables?archived=false'),
                    fetch('/api/tables?archived=true')
                ]);
                const act = actRes.ok ? await actRes.json() : [];
                const arc = arcRes.ok ? await arcRes.json() : [];
                const toLocal = (arr, isActive) => arr.map(t => ({ id: t.id, title: t.name, isActive, createdAt: t.created_at || new Date().toISOString(), reservations: [] }));
                const combined = [...toLocal(act, true), ...toLocal(arc, false)];
                if (combined.length) setTables(combined);
            } catch (e) {}
        })();
    }, [setTables]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                <Route path="/" element={<Dashboard tables={activeTables} onCreateTable={handleCreateTable} onLogout={handleLogout} onArchive={handleToggleArchive} onDelete={handleDeleteTable} />} />
                <Route path="/archives" element={<Archives tables={archivedTables} onUnarchive={handleToggleArchive} onLogout={handleLogout} onDelete={handleDeleteTable} />} />
                <Route path="/table/:tableId" element={<TableauView allTables={tables} updateTable={updateTableReservations} onLogout={handleLogout} updateTableTitle={updateTableTitle} />} />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default App;
