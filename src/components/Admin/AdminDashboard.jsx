import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CatalogManagement from './CatalogManagement';
import UserManagement from './UserManagement';
import DatabaseTools from './DatabaseTools';
import SystemSettings from './SystemSettings';
import ConnectionTypes from './ConnectionTypes';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('catalog');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="admin-access-denied">
          <h1>⛔ Zugriff verweigert</h1>
          <p>Du benötigst Admin-Rechte, um auf diesen Bereich zuzugreifen.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>🛠️ Admin-Bereich</h1>
            <p className="admin-subtitle">Roots Configurator Verwaltung</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Zurück zum Dashboard
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          📦 Katalog-Verwaltung
        </button>
        <button
          className={`admin-tab ${activeTab === 'connectiontypes' ? 'active' : ''}`}
          onClick={() => setActiveTab('connectiontypes')}
        >
          🔌 Verbindungstypen
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Benutzer-Verwaltung
        </button>
        <button
          className={`admin-tab ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          🗄️ Datenbank-Tools
        </button>
        <button
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ System-Einstellungen
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'catalog' && <CatalogManagement />}
        {activeTab === 'connectiontypes' && <ConnectionTypes />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'database' && <DatabaseTools />}
        {activeTab === 'settings' && <SystemSettings />}
      </div>
    </div>
  );
}
