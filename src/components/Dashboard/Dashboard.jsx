import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI } from '../../api/client';
import ProjectSettingsModal from './ProjectSettingsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at'); // 'updated_at' or 'name'
  const [settingsModalProject, setSettingsModalProject] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.projects || []);
      setError('');
    } catch (err) {
      setError('Fehler beim Laden der Projekte: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const response = await projectsAPI.create({
        name: 'Neues Projekt',
        description: '',
        tags: [],
        building: {},
      });

      // Navigate to configurator with new project
      navigate(`/configurator/${response.project.id}`);
    } catch (err) {
      setError('Fehler beim Erstellen: ' + err.message);
    }
  };

  const handleOpenProject = (projectId) => {
    navigate(`/configurator/${projectId}`);
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!confirm(`Projekt "${projectName}" wirklich löschen?`)) {
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err) {
      setError('Fehler beim Löschen: ' + err.message);
    }
  };

  const handleDuplicateProject = async (projectId) => {
    try {
      const response = await projectsAPI.duplicate(projectId);
      await loadProjects(); // Reload to show duplicate
    } catch (err) {
      setError('Fehler beim Duplizieren: ' + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const search = searchTerm.toLowerCase();
      return (
        project.name.toLowerCase().includes(search) ||
        (project.description && project.description.toLowerCase().includes(search)) ||
        (project.building_name && project.building_name.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <header className="bg-[#242424] border-b border-white/10 px-10 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-[#2ea043] text-[28px] font-semibold mb-1">Roots Configurator</h1>
          <p className="text-white/60 text-sm m-0">Projekt-Übersicht</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Button
                onClick={() => navigate('/admin')}
                variant="secondary"
                className="bg-white/10 border-white/20 hover:bg-white/15"
              >
                Admin
              </Button>
            )}
            <span className="text-white/87 text-sm font-medium">{user?.name}</span>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="bg-white/10 border-white/20 hover:bg-white/15"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="px-10 py-8 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex gap-3 flex-1 max-w-[600px]">
            <Input
              type="text"
              placeholder="Projekte durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-[#242424] border-white/20 focus-visible:border-[#2ea043]"
            />

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] bg-[#242424] border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary border-border">
                <SelectItem value="updated_at">Zuletzt bearbeitet</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreateProject}
            className="bg-[#2ea043] hover:bg-[#26843a] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(46,160,67,0.3)] transition-all whitespace-nowrap"
          >
            + Neues Projekt
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive/80 px-4 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-[60px] text-white/60 text-base">
            Lade Projekte...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 text-white/60">
            {searchTerm ? (
              <p className="text-lg m-0">Keine Projekte gefunden für "{searchTerm}"</p>
            ) : (
              <>
                <p className="text-lg m-0 mb-4">Noch keine Projekte vorhanden.</p>
                <Button
                  onClick={handleCreateProject}
                  className="bg-[#2ea043] hover:bg-[#26843a] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(46,160,67,0.3)] transition-all px-7 py-3.5 h-auto text-base"
                >
                  Erstes Projekt erstellen
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[#242424] border border-white/10 rounded-xl p-5 transition-all cursor-pointer hover:border-[#2ea043] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(46,160,67,0.2)]"
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h3 className="text-white/87 text-lg font-semibold m-0 flex-1">
                    {project.name}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenProject(project.id); }}
                      className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-base cursor-pointer transition-all hover:bg-white/10 hover:scale-110"
                      title="Öffnen"
                    >
                      ▶
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSettingsModalProject(project); }}
                      className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-base cursor-pointer transition-all hover:bg-white/10 hover:scale-110"
                      title="Einstellungen"
                    >
                      ⚙
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicateProject(project.id); }}
                      className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-base cursor-pointer transition-all hover:bg-white/10 hover:scale-110"
                      title="Duplizieren"
                    >
                      ⊕
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id, project.name); }}
                      className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-base cursor-pointer transition-all hover:bg-destructive/10 hover:border-destructive hover:scale-110"
                      title="Löschen"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="text-white/60 text-sm m-0 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                <div className="flex flex-col gap-2 mb-3">
                  {project.building_name && (
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-white/50 min-w-[140px]">Gebäude:</span>
                      <span className="text-white/87 font-mono">{project.building_name}</span>
                    </div>
                  )}

                  {project.building_address && (
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-white/50 min-w-[140px]">Adresse:</span>
                      <span className="text-white/87 font-mono">{project.building_address}</span>
                    </div>
                  )}

                  {project.beheizte_flaeche && (
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-white/50 min-w-[140px]">Beheizte Fläche:</span>
                      <span className="text-white/87 font-mono">{project.beheizte_flaeche} m²</span>
                    </div>
                  )}

                  {project.anzahl_wohnungen && (
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-white/50 min-w-[140px]">Wohnungen:</span>
                      <span className="text-white/87 font-mono">{project.anzahl_wohnungen}</span>
                    </div>
                  )}

                  {project.anzahl_stockwerke && (
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-white/50 min-w-[140px]">Stockwerke:</span>
                      <span className="text-white/87 font-mono">{project.anzahl_stockwerke}</span>
                    </div>
                  )}

                  {project.eigentuemer && (
                    <div className="flex gap-2 text-[13px]">
                      <span className="text-white/50 min-w-[140px]">Eigentümer:</span>
                      <span className="text-white/87 font-mono">{project.eigentuemer}</span>
                    </div>
                  )}

                  <div className="flex gap-2 text-[13px]">
                    <span className="text-white/50 min-w-[140px]">Erstellt von:</span>
                    <span className="text-white/87 font-mono">{project.owner_name}</span>
                  </div>

                  <div className="flex gap-2 text-[13px]">
                    <span className="text-white/50 min-w-[140px]">Zuletzt bearbeitet:</span>
                    <span className="text-white/87 font-mono">{formatDate(project.updated_at)}</span>
                  </div>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-[#2ea043]/15 text-[#2ea043] border border-[#2ea043]/30 rounded px-2.5 py-1 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Settings Modal */}
      {settingsModalProject && (
        <ProjectSettingsModal
          project={settingsModalProject}
          onClose={() => setSettingsModalProject(null)}
          onSave={() => {
            loadProjects(); // Reload projects to show updated metadata
          }}
        />
      )}
    </div>
  );
}
