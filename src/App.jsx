import { useState, useEffect } from 'react';
import ConfiguratorEditor from './components/ConfiguratorEditor/ConfiguratorEditor';
import ListView from './components/ListView/ListView';
import ModuleDatabase from './components/ModuleDatabase/ModuleDatabase';
import { initialModules } from './data/moduleDatabase';

function App() {
  const [activeTab, setActiveTab] = useState('konfigurator');

  // Moduldatenbank State (mit localStorage Persistenz)
  const [modules, setModules] = useState(() => {
    const stored = localStorage.getItem('roots-modules');
    return stored ? JSON.parse(stored) : initialModules;
  });

  useEffect(() => {
    localStorage.setItem('roots-modules', JSON.stringify(modules));
  }, [modules]);

  // Konfigurations State (mit localStorage Persistenz)
  const [configuration, setConfiguration] = useState(() => {
    const stored = localStorage.getItem('roots-configuration');
    return stored
      ? JSON.parse(stored)
      : {
          building: null,
          chain: [],
        };
  });

  useEffect(() => {
    localStorage.setItem('roots-configuration', JSON.stringify(configuration));
  }, [configuration]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          Roots Systemkonfigurator
        </h1>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Modulare Wärmepumpen-Planung für Roots Energy
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'konfigurator' ? 'active' : ''}`}
          onClick={() => setActiveTab('konfigurator')}
        >
          Konfigurator
        </button>
        <button
          className={`tab ${activeTab === 'liste' ? 'active' : ''}`}
          onClick={() => setActiveTab('liste')}
        >
          Listenansicht
        </button>
        <button
          className={`tab ${activeTab === 'datenbank' ? 'active' : ''}`}
          onClick={() => setActiveTab('datenbank')}
        >
          Moduldatenbank
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'konfigurator' && (
          <ConfiguratorEditor
            modules={modules}
            configuration={configuration}
            setConfiguration={setConfiguration}
          />
        )}

        {activeTab === 'liste' && <ListView configuration={configuration} />}

        {activeTab === 'datenbank' && (
          <ModuleDatabase modules={modules} setModules={setModules} />
        )}
      </div>
    </div>
  );
}

export default App;
