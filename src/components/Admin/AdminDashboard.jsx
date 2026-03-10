import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CatalogManagement from './CatalogManagement';
import UserManagement from './UserManagement';
import DatabaseTools from './DatabaseTools';
import SystemSettings from './SystemSettings';
import ConnectionTypes from './ConnectionTypes';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('catalog');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-8">
          <h1 className="text-5xl mb-4 text-destructive">⛔ Zugriff verweigert</h1>
          <p className="text-lg text-foreground-secondary mb-8">
            Du benötigst Admin-Rechte, um auf diesen Bereich zuzugreifen.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-accent hover:bg-accent/90 text-background px-6 py-3 h-auto text-base"
          >
            Zurück zum Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-background-secondary border-b-2 border-accent px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div>
            <h1 className="m-0 text-[28px] text-accent">🛠️ Admin-Bereich</h1>
            <p className="mt-1 mb-0 text-sm text-foreground-secondary">
              Roots Configurator Verwaltung
            </p>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            className="bg-background-tertiary border border-border hover:bg-background hover:border-accent"
          >
            ← Zurück zum Dashboard
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-background-secondary border-b border-border px-8">
        <div className="max-w-[1400px] mx-auto flex gap-1">
          <button
            className={`px-6 py-4 bg-transparent border-none border-b-[3px] font-semibold text-sm cursor-pointer transition-all ${
              activeTab === 'catalog'
                ? 'text-accent border-b-accent bg-background'
                : 'text-foreground-secondary border-b-transparent hover:text-foreground hover:bg-background-tertiary'
            }`}
            onClick={() => setActiveTab('catalog')}
          >
            📦 Katalog-Verwaltung
          </button>
          <button
            className={`px-6 py-4 bg-transparent border-none border-b-[3px] font-semibold text-sm cursor-pointer transition-all ${
              activeTab === 'connectiontypes'
                ? 'text-accent border-b-accent bg-background'
                : 'text-foreground-secondary border-b-transparent hover:text-foreground hover:bg-background-tertiary'
            }`}
            onClick={() => setActiveTab('connectiontypes')}
          >
            🔌 Verbindungstypen
          </button>
          <button
            className={`px-6 py-4 bg-transparent border-none border-b-[3px] font-semibold text-sm cursor-pointer transition-all ${
              activeTab === 'users'
                ? 'text-accent border-b-accent bg-background'
                : 'text-foreground-secondary border-b-transparent hover:text-foreground hover:bg-background-tertiary'
            }`}
            onClick={() => setActiveTab('users')}
          >
            👥 Benutzer-Verwaltung
          </button>
          <button
            className={`px-6 py-4 bg-transparent border-none border-b-[3px] font-semibold text-sm cursor-pointer transition-all ${
              activeTab === 'database'
                ? 'text-accent border-b-accent bg-background'
                : 'text-foreground-secondary border-b-transparent hover:text-foreground hover:bg-background-tertiary'
            }`}
            onClick={() => setActiveTab('database')}
          >
            🗄️ Datenbank-Tools
          </button>
          <button
            className={`px-6 py-4 bg-transparent border-none border-b-[3px] font-semibold text-sm cursor-pointer transition-all ${
              activeTab === 'settings'
                ? 'text-accent border-b-accent bg-background'
                : 'text-foreground-secondary border-b-transparent hover:text-foreground hover:bg-background-tertiary'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ System-Einstellungen
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto p-8">
        {activeTab === 'catalog' && <CatalogManagement />}
        {activeTab === 'connectiontypes' && <ConnectionTypes />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'database' && <DatabaseTools />}
        {activeTab === 'settings' && <SystemSettings />}
      </div>
    </div>
  );
}
