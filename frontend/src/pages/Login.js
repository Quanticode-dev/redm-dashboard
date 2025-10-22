import { useState } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password });
      localStorage.setItem("token", res.data.access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
      setUser(res.data.user);
      toast.success("Erfolgreich angemeldet!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login fehlgeschlagen");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #2a2419 0%, #3d2f1f 50%, #2a2419 100%)' }}>
      <div className="w-full max-w-md">
        <div className="rdr-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#3d2f1f', fontFamily: 'Pirata One, cursive' }}>RedM Dashboard</h1>
            <p className="text-sm" style={{ color: '#6d5838' }}>Willkommen zurück, Homie!</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" style={{ color: '#3d2f1f', fontWeight: 600 }}>Benutzername</Label>
              <Input
                id="username"
                data-testid="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rdr-input w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: '#3d2f1f', fontWeight: 600 }}>Passwort</Label>
              <Input
                id="password"
                data-testid="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rdr-input w-full"
              />
            </div>
            
            <Button
              data-testid="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full rdr-button"
            >
              {loading ? "Anmelden..." : "Anmelden"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}