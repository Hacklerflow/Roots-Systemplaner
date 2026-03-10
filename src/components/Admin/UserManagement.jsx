import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
    return <div className="bg-background-secondary border border-border rounded-lg p-6">Lade Benutzer...</div>;
  }

  return (
    <div>
      <div className="bg-background-secondary border border-border rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Benutzer-Verwaltung</h2>
            <p className="text-foreground-secondary text-sm">
              Verwalte alle Benutzer und ihre Berechtigungen
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-accent hover:bg-accent/90"
          >
            + Neuer Benutzer
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <StatCard label="Gesamt" value={users.length} color="text-accent" />
          <StatCard label="Admins" value={users.filter(u => u.role === 'admin').length} color="text-destructive" />
          <StatCard label="Benutzer" value={users.filter(u => u.role === 'user').length} color="text-success" />
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wide">Name</th>
                <th className="text-left p-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wide">E-Mail</th>
                <th className="text-left p-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wide">Rolle</th>
                <th className="text-left p-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wide">Erstellt am</th>
                <th className="text-left p-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wide">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-border">
                  <td className="p-4 text-sm">
                    <strong>{user.name}</strong>
                  </td>
                  <td className="p-4 text-sm">{user.email}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-destructive/15 text-destructive'
                        : 'bg-success/15 text-success'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(user.created_at).toLocaleDateString('de-DE')}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleChangeRole(user.id, user.role)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Rolle ändern
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                      >
                        Löschen
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]">
          <div className="bg-background-secondary rounded-xl p-8 max-w-lg w-[90%] border-2 border-accent">
            <h2 className="text-xl font-semibold mb-6">Neuen Benutzer erstellen</h2>
            <p className="text-foreground-secondary mb-6">
              Diese Funktion wird bald verfügbar sein.
            </p>
            <Button
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-accent hover:bg-accent/90"
            >
              Schließen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="flex-1 bg-background-tertiary border border-border rounded-lg p-4">
      <div className="text-xs text-foreground-secondary mb-2">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
