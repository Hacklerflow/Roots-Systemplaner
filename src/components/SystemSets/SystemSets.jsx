import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SystemSets({
  systemSets,
  activeSetId,
  onCreateSet,
  onSwitchSet,
  onDeleteSet,
  onImportSets,
}) {
  const [newSetName, setNewSetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);

  const handleCreate = () => {
    if (!newSetName.trim()) {
      alert('Bitte einen Namen eingeben!');
      return;
    }
    onCreateSet(newSetName.trim());
    setNewSetName('');
    setIsCreating(false);
  };

  const handleSwitch = (setId) => {
    if (setId === activeSetId) return;

    if (confirm('Möchtest du wirklich das System Set wechseln?\n\nAlle aktuellen Kataloge (Module, Leitungen, etc.) werden durch das ausgewählte Set ersetzt!')) {
      onSwitchSet(setId);
    }
  };

  const handleDelete = (setId, setName) => {
    if (setId === activeSetId) {
      alert('Das aktive Set kann nicht gelöscht werden!');
      return;
    }

    if (confirm(`System Set "${setName}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`)) {
      onDeleteSet(setId);
    }
  };

  // Export einzelnes Set
  const handleExportSet = (set) => {
    const exportData = {
      version: '1.0',
      type: 'roots-system-set',
      exportDate: new Date().toISOString(),
      set: set,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `SystemSet_${set.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export alle Sets
  const handleExportAllSets = () => {
    if (systemSets.length === 0) {
      alert('Keine System Sets zum Exportieren vorhanden!');
      return;
    }

    const exportData = {
      version: '1.0',
      type: 'roots-system-sets-collection',
      exportDate: new Date().toISOString(),
      sets: systemSets,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const today = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RootsSystemSets_${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Sets
  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Validierung
        if (!imported.version || !imported.type) {
          alert('Ungültige Datei: Falsches Format!');
          return;
        }

        let setsToImport = [];

        // Einzelnes Set oder Collection?
        if (imported.type === 'roots-system-set' && imported.set) {
          setsToImport = [imported.set];
        } else if (imported.type === 'roots-system-sets-collection' && imported.sets) {
          setsToImport = imported.sets;
        } else {
          alert('Ungültige Datei: Unbekannter Typ!');
          return;
        }

        // Validiere Set-Struktur
        const invalidSets = setsToImport.filter(set =>
          !set.id || !set.name || !set.createdAt
        );

        if (invalidSets.length > 0) {
          alert('Ungültige Datei: Ein oder mehrere Sets haben eine ungültige Struktur!');
          return;
        }

        // Import durchführen
        onImportSets(setsToImport);
        alert(`${setsToImport.length} System Set(s) erfolgreich importiert!`);
      } catch (error) {
        console.error('Import-Fehler:', error);
        alert('Fehler beim Importieren: Ungültige JSON-Datei!');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const activeSet = systemSets.find(s => s.id === activeSetId);

  return (
    <div className="bg-background min-h-[calc(100vh-140px)] p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="m-0 mb-1 text-2xl">System Sets</h2>
        <p className="m-0 text-sm text-foreground-secondary">
          Verwalte deine Katalog-Vorlagen (Module, Leitungen, Dimensionen, etc.)
        </p>
      </div>

      {/* Info Box - Was wird gespeichert */}
      <div className="bg-background-secondary border border-border rounded-lg p-4 mb-6 max-w-[700px]">
        <h3 className="m-0 mb-3 text-sm font-semibold">
          Ein System Set speichert folgende Kataloge:
        </h3>
        <div className="grid grid-cols-2 gap-2 text-[13px] text-foreground-secondary">
          <div>
            <strong className="text-foreground">Moduldatenbank:</strong>
            <div className="ml-3 mt-1 leading-relaxed">
              • Module<br/>
              • Modultypen
            </div>
          </div>
          <div>
            <strong className="text-foreground">Einstellungen:</strong>
            <div className="ml-3 mt-1 leading-relaxed">
              • Verbindungen<br/>
              • Leitungen<br/>
              • Dimensionen<br/>
              • Formeln<br/>
              • Pumpen<br/>
              • Sole
            </div>
          </div>
        </div>
        <p className="m-0 mt-3 text-xs text-foreground-secondary italic">
          Tipp: Erstelle Sets für verschiedene Projekttypen (z.B. "Einfamilienhaus Standard", "Gewerbe 2024")
        </p>
      </div>

      {/* Import/Export Buttons */}
      <div className="flex gap-3 mb-6 max-w-[700px]">
        <Button
          onClick={handleExportAllSets}
          disabled={systemSets.length === 0}
          className="flex-1 bg-success hover:bg-success/90 text-white disabled:bg-background-tertiary disabled:text-foreground-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Alle Sets exportieren
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-accent hover:bg-accent/90 text-background"
        >
          Sets importieren
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>

      {/* Active Set Display */}
      {activeSet && (
        <div className="bg-background-secondary border-2 border-accent rounded-lg p-5 mb-6 max-w-[700px]">
          <div className="text-xs text-accent font-semibold mb-2">
            AKTIVES SET
          </div>
          <div className="text-xl font-semibold mb-1">
            {activeSet.name}
          </div>
          <div className="text-[13px] text-foreground-secondary">
            Erstellt am {new Date(activeSet.createdAt).toLocaleDateString('de-DE')}
          </div>
          <div className="text-xs text-foreground-secondary mt-3">
            {activeSet.modules?.length || 0} Module • {activeSet.leitungskatalog?.length || 0} Leitungen • {activeSet.dimensionskatalog?.length || 0} Dimensionen
          </div>
        </div>
      )}

      {/* Create New Set */}
      <div className="bg-background-secondary border border-border rounded-lg p-5 mb-6 max-w-[700px]">
        <h3 className="m-0 mb-4 text-base">
          Neues System Set erstellen
        </h3>
        {!isCreating ? (
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full bg-accent hover:bg-accent/90 text-background"
          >
            + Aktuellen Stand als neues Set speichern
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewSetName('');
                }
              }}
              placeholder="z.B. Wien System Set"
              autoFocus
              className="flex-1 bg-background-tertiary border-border"
            />
            <Button
              onClick={handleCreate}
              className="bg-success hover:bg-success/90 text-white px-5"
            >
              Speichern
            </Button>
            <Button
              onClick={() => {
                setIsCreating(false);
                setNewSetName('');
              }}
              variant="secondary"
              className="bg-background-tertiary border-border px-5"
            >
              Abbrechen
            </Button>
          </div>
        )}
      </div>

      {/* Available Sets */}
      <div className="max-w-[700px]">
        <h3 className="m-0 mb-4 text-base">
          Verfügbare System Sets ({systemSets.length})
        </h3>
        {systemSets.length === 0 ? (
          <div className="p-10 text-center text-foreground-secondary text-sm bg-background-secondary rounded-lg">
            Noch keine System Sets vorhanden
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {systemSets.map((set) => (
              <div
                key={set.id}
                className={`${
                  set.id === activeSetId ? 'bg-background-tertiary border-accent' : 'bg-background-secondary border-border'
                } border rounded-lg p-4 flex justify-between items-center`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-base font-semibold">
                      {set.name}
                    </span>
                    {set.id === activeSetId && (
                      <span className="text-[10px] px-2.5 py-0.5 bg-accent text-background rounded-xl font-semibold">
                        AKTIV
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground-secondary">
                    {new Date(set.createdAt).toLocaleDateString('de-DE')} • {set.modules?.length || 0} Module • {set.leitungskatalog?.length || 0} Leitungen
                  </div>
                </div>
                <div className="flex gap-2">
                  {set.id !== activeSetId && (
                    <Button
                      onClick={() => handleSwitch(set.id)}
                      className="bg-accent hover:bg-accent/90 text-background text-[13px] px-4 py-2 h-auto"
                    >
                      Aktivieren
                    </Button>
                  )}
                  <Button
                    onClick={() => handleExportSet(set)}
                    className="bg-success hover:bg-success/90 text-white text-[13px] px-4 py-2 h-auto"
                  >
                    Export
                  </Button>
                  <Button
                    onClick={() => handleDelete(set.id, set.name)}
                    disabled={set.id === activeSetId}
                    variant="destructive"
                    className="bg-destructive hover:bg-destructive/90 disabled:bg-background-tertiary disabled:text-foreground-secondary disabled:cursor-not-allowed disabled:opacity-50 text-[13px] px-4 py-2 h-auto"
                  >
                    Löschen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
