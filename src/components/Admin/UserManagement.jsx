import { useState, useEffect } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: API call to load users
      // const response = await usersAPI.getAll();
      // setUsers(response.users);

      // Dummy data for now
      setUsers([
        { id: 1, name: 'Admin User', email: 'admin@roots.energy', role: 'admin', created_at: '2024-01-01' },
        { id: 2, name: 'Normal User', email: 'user@roots.energy', role: 'user', created_at: '2024-01-15' },
      ]);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Benutzer "${userName}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`)) {
      return;
    }

    try {
      // TODO: API call to delete user
      // await usersAPI.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('Benutzer erfolgreich gelöscht!');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen des Benutzers!');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    if (!confirm(`Rolle wirklich auf "${newRole}" ändern?`)) {
      return;
    }

    try {
      // TODO: API call to update role
      // await usersAPI.updateRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('Rolle erfolgreich geändert!');
    } catch (error) {
      console.error('Fehler beim Ändern der Rolle:', error);
      alert('Fehler beim Ändern der Rolle!');
    }
  };

  if (loading) {
    return <div className="admin-section">Lade Benutzer...</div>;
  }

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">👥 Benutzer-Verwaltung</h2>
            <p className="admin-section-description">
              Verwalte alle Benutzer und ihre Berechtigungen
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="admin-button admin-button-primary"
          >
            + Neuer Benutzer
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="Gesamt" value={users.length} color="var(--accent)" />
          <StatCard label="Admins" value={users.filter(u => u.role === 'admin').length} color="var(--error)" />
          <StatCard label="Benutzer" value={users.filter(u => u.role === 'user').length} color="var(--success)" />
        </div>

        {/* User Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>E-Mail</th>
                <th style={tableHeaderStyle}>Rolle</th>
                <th style={tableHeaderStyle}>Erstellt am</th>
                <th style={tableHeaderStyle}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tableCellStyle}>
                    <strong>{user.name}</strong>
                  </td>
                  <td style={tableCellStyle}>{user.email}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: user.role === 'admin' ? '#ef4444' : '#22c55e',
                    }}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    {new Date(user.created_at).toLocaleDateString('de-DE')}
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleChangeRole(user.id, user.role)}
                        className="admin-button admin-button-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Rolle ändern
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="admin-button admin-button-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal - Placeholder */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            border: '2px solid var(--accent)',
          }}>
            <h2 style={{ margin: '0 0 24px 0' }}>Neuen Benutzer erstellen</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Diese Funktion wird bald verfügbar sein.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="admin-button admin-button-primary"
              style={{ width: '100%' }}
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
    }}>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

const tableHeaderStyle = {
  textAlign: 'left',
  padding: '12px',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tableCellStyle = {
  padding: '16px 12px',
  fontSize: '14px',
};
