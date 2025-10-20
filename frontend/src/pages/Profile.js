import { useState } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Profile({ user }) {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    try {
      await axios.post(`${API}/auth/change-password`, {
        old_password: oldPassword,
        new_password: newPassword
      });
      toast.success("Passwort erfolgreich geändert");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Fehler beim Ändern des Passworts");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Button
        data-testid="back-button"
        onClick={() => navigate("/")}
        className="rdr-button mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Zurück
      </Button>

      <div className="rdr-card">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#3d2f1f' }}>Profil</h2>
        
        <div className="mb-8 p-4 rounded" style={{ background: 'rgba(139, 115, 85, 0.15)' }}>
          <p className="text-sm" style={{ color: '#6d5838' }}>Benutzername</p>
          <p className="text-xl font-bold" style={{ color: '#3d2f1f' }}>{user.username}</p>
          
          <p className="text-sm mt-4" style={{ color: '#6d5838' }}>Rolle</p>
          <p className="text-lg font-semibold" style={{ color: '#3d2f1f' }}>
            {user.is_admin ? 'Administrator' : 'Benutzer'}
          </p>
          
          <p className="text-sm mt-4" style={{ color: '#6d5838' }}>Berechtigungen</p>
          <div className="flex gap-2 mt-2">
            {user.permissions.map(perm => (
              <span key={perm} className="px-3 py-1 rounded text-sm" style={{ background: '#8b7355', color: '#f4e8d0' }}>
                {perm}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="text-xl font-bold" style={{ color: '#3d2f1f' }}>Passwort ändern</h3>
          
          <div>
            <Label style={{ color: '#3d2f1f' }}>Altes Passwort</Label>
            <Input
              data-testid="old-password-input"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="rdr-input w-full"
            />
          </div>
          
          <div>
            <Label style={{ color: '#3d2f1f' }}>Neues Passwort</Label>
            <Input
              data-testid="new-password-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="rdr-input w-full"
            />
          </div>
          
          <div>
            <Label style={{ color: '#3d2f1f' }}>Passwort bestätigen</Label>
            <Input
              data-testid="confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rdr-input w-full"
            />
          </div>
          
          <Button
            data-testid="change-password-button"
            type="submit"
            className="rdr-button w-full"
          >
            Passwort ändern
          </Button>
        </form>
      </div>
    </div>
  );
}