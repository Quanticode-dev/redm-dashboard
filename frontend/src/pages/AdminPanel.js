import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    display_name: "",
    is_admin: false,
    permissions: []
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`);
      setUsers(res.data);
    } catch (err) {
      toast.error("Fehler beim Laden der Benutzer");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast.error("Benutzername und Passwort erforderlich");
      return;
    }

    try {
      await axios.post(`${API}/admin/users`, newUser);
      toast.success("Benutzer erstellt");
      setNewUser({ username: "", password: "", display_name: "", is_admin: false, permissions: [] });
      setShowAddForm(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Fehler beim Erstellen");
    }
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`${API}/admin/users/${editingUser.id}`, {
        is_admin: editingUser.is_admin,
        permissions: editingUser.permissions
      });
      toast.success("Benutzer aktualisiert");
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Benutzer wirklich löschen?")) return;
    
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success("Benutzer gelöscht");
      loadUsers();
    } catch (err) {
      toast.error("Fehler beim Löschen");
    }
  };

  const togglePermission = (user, permission) => {
    const permissions = user.permissions.includes(permission)
      ? user.permissions.filter(p => p !== permission)
      : [...user.permissions, permission];
    return { ...user, permissions };
  };

  const permissions = ["hunter", "map", "zug"];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <Button
        data-testid="back-button"
        onClick={() => navigate("/")}
        className="rdr-button mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Zurück
      </Button>

      <div className="rdr-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#3d2f1f' }}>Benutzerverwaltung</h2>
          <Button
            data-testid="add-user-button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rdr-button"
          >
            <Plus size={16} className="mr-2" />
            Benutzer hinzufügen
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 rounded" style={{ background: 'rgba(139, 115, 85, 0.15)' }}>
            <h3 className="font-bold mb-3" style={{ color: '#3d2f1f' }}>Neuer Benutzer</h3>
            <div className="space-y-3">
              <div>
                <Label style={{ color: '#3d2f1f' }}>Benutzername</Label>
                <Input
                  data-testid="new-user-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="rdr-input w-full"
                />
              </div>
              <div>
                <Label style={{ color: '#3d2f1f' }}>Anzeigename (optional)</Label>
                <Input
                  data-testid="new-user-displayname"
                  value={newUser.display_name}
                  onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
                  className="rdr-input w-full"
                  placeholder="Leer lassen für Benutzername"
                />
              </div>
              <div>
                <Label style={{ color: '#3d2f1f' }}>Passwort</Label>
                <Input
                  data-testid="new-user-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="rdr-input w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  data-testid="new-user-admin-checkbox"
                  checked={newUser.is_admin}
                  onCheckedChange={(checked) => setNewUser({...newUser, is_admin: checked})}
                />
                <Label style={{ color: '#3d2f1f' }}>Administrator</Label>
              </div>
              <div>
                <Label style={{ color: '#3d2f1f' }}>Berechtigungen</Label>
                <div className="flex gap-4 mt-2">
                  {permissions.map(perm => (
                    <div key={perm} className="flex items-center gap-2">
                      <Checkbox
                        data-testid={`new-user-perm-${perm}`}
                        checked={newUser.permissions.includes(perm)}
                        onCheckedChange={(checked) => {
                          const perms = checked
                            ? [...newUser.permissions, perm]
                            : newUser.permissions.filter(p => p !== perm);
                          setNewUser({...newUser, permissions: perms});
                        }}
                      />
                      <Label style={{ color: '#3d2f1f' }}>{perm}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button data-testid="save-new-user" onClick={handleAddUser} className="rdr-button w-full">Speichern</Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="p-4 rounded" style={{ background: 'rgba(244, 232, 208, 0.5)' }}>
              {editingUser?.id === user.id ? (
                <div className="space-y-3">
                  <div>
                    <Label style={{ color: '#3d2f1f' }}>Benutzername: {editingUser.username}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={editingUser.is_admin}
                      onCheckedChange={(checked) => setEditingUser({...editingUser, is_admin: checked})}
                    />
                    <Label style={{ color: '#3d2f1f' }}>Administrator</Label>
                  </div>
                  <div>
                    <Label style={{ color: '#3d2f1f' }}>Berechtigungen</Label>
                    <div className="flex gap-4 mt-2">
                      {permissions.map(perm => (
                        <div key={perm} className="flex items-center gap-2">
                          <Checkbox
                            checked={editingUser.permissions.includes(perm)}
                            onCheckedChange={(checked) => {
                              const perms = checked
                                ? [...editingUser.permissions, perm]
                                : editingUser.permissions.filter(p => p !== perm);
                              setEditingUser({...editingUser, permissions: perms});
                            }}
                          />
                          <Label style={{ color: '#3d2f1f' }}>{perm}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateUser} className="rdr-button flex-1">Speichern</Button>
                    <Button onClick={() => setEditingUser(null)} className="rdr-button flex-1">Abbrechen</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: '#3d2f1f' }}>{user.username}</h4>
                    <p className="text-sm" style={{ color: '#6d5838' }}>
                      {user.is_admin ? 'Administrator' : 'Benutzer'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {user.permissions.map(perm => (
                        <span key={perm} className="px-2 py-1 rounded text-xs" style={{ background: '#8b7355', color: '#f4e8d0' }}>
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      data-testid={`edit-user-${user.id}`}
                      onClick={() => setEditingUser(user)}
                      className="p-2 rounded hover:bg-[#8b7355] hover:bg-opacity-30"
                    >
                      <Edit2 size={16} style={{ color: '#3d2f1f' }} />
                    </button>
                    <button
                      data-testid={`delete-user-${user.id}`}
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 rounded hover:bg-[#8b7355] hover:bg-opacity-30"
                    >
                      <Trash2 size={16} style={{ color: '#8b4513' }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}