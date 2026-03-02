import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI } from '../../api/client';
import './Dashboard.css';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at'); // 'updated_at' or 'name'

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
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Roots Configurator</h1>
          <p className="dashboard-subtitle">Projekt-Übersicht</p>
        </div>
        <div className="dashboard-header-right">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-toolbar">
          <div className="toolbar-left">
            <input
              type="text"
              placeholder="Projekte durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="updated_at">Zuletzt bearbeitet</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          <button onClick={handleCreateProject} className="create-project-button">
            + Neues Projekt
          </button>
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">Lade Projekte...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="dashboard-empty">
            {searchTerm ? (
              <p>Keine Projekte gefunden für "{searchTerm}"</p>
            ) : (
              <>
                <p>Noch keine Projekte vorhanden.</p>
                <button onClick={handleCreateProject} className="create-project-button-large">
                  Erstes Projekt erstellen
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3 className="project-name">{project.name}</h3>
                  <div className="project-actions">
                    <button
                      onClick={() => handleOpenProject(project.id)}
                      className="project-action-button"
                      title="Öffnen"
                    >
                      📂
                    </button>
                    <button
                      onClick={() => handleDuplicateProject(project.id)}
                      className="project-action-button"
                      title="Duplizieren"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="project-action-button project-action-delete"
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}

                <div className="project-metadata">
                  {project.building_name && (
                    <div className="metadata-item">
                      <span className="metadata-label">Gebäude:</span>
                      <span className="metadata-value">{project.building_name}</span>
                    </div>
                  )}

                  {project.building_address && (
                    <div className="metadata-item">
                      <span className="metadata-label">Adresse:</span>
                      <span className="metadata-value">{project.building_address}</span>
                    </div>
                  )}

                  <div className="metadata-item">
                    <span className="metadata-label">Erstellt von:</span>
                    <span className="metadata-value">{project.owner_name}</span>
                  </div>

                  <div className="metadata-item">
                    <span className="metadata-label">Zuletzt bearbeitet:</span>
                    <span className="metadata-value">{formatDate(project.updated_at)}</span>
                  </div>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="project-tags">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="project-tag">
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
    </div>
  );
}
