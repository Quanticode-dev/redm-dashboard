import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import Hunter from "./Hunter";
import Profile from "./Profile";
import AdminPanel from "./AdminPanel";
import { LogOut, User, Shield } from "lucide-react";
import axios from "axios";

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  const tiles = [
    { id: "hunter", name: "Hunter", path: "/hunter", permission: "hunter" },
    { id: "map", name: "Map", path: "/map", permission: "map" },
    { id: "zug", name: "Zug", path: "/zug", permission: "zug" },
  ];

  const hasPermission = (permission) => {
    return user.is_admin || user.permissions.includes(permission);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2a2419 0%, #3d2f1f 50%, #2a2419 100%)' }}>
      {/* Header */}
      <header className="leather-texture border-b-4 border-[#8b7355] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#f4e8d0', fontFamily: 'Pirata One, cursive' }}>Hunter Dashboard</h1>
            <p className="text-sm" style={{ color: '#d4c5a9' }}>Willkommen, {user.username}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              data-testid="profile-button"
              onClick={() => navigate("/profile")}
              className="rdr-button flex items-center gap-2"
            >
              <User size={16} />
              Profil
            </Button>
            
            {user.is_admin && (
              <Button
                data-testid="admin-button"
                onClick={() => navigate("/admin")}
                className="rdr-button flex items-center gap-2"
              >
                <Shield size={16} />
                Admin
              </Button>
            )}
            
            <Button
              data-testid="logout-button"
              onClick={handleLogout}
              className="rdr-button flex items-center gap-2"
            >
              <LogOut size={16} />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Routes>
        <Route path="/" element={
          <div className="max-w-7xl mx-auto p-8">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#f4e8d0' }}>Bereiche</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiles.map((tile) => (
                hasPermission(tile.permission) && (
                  <button
                    key={tile.id}
                    data-testid={`tile-${tile.id}`}
                    onClick={() => navigate(tile.path)}
                    className="dashboard-tile p-8 hover:scale-105 transition-transform duration-300 cursor-pointer"
                  >
                    <h3 className="text-2xl font-bold text-center" style={{ color: '#3d2f1f' }}>{tile.name}</h3>
                  </button>
                )
              ))}
            </div>
          </div>
        } />
        <Route path="/hunter" element={hasPermission("hunter") ? <Hunter user={user} /> : <div className="text-center text-white p-8">Keine Berechtigung</div>} />
        <Route path="/map" element={hasPermission("map") ? <div className="text-center text-white p-8">Map - Wird später hinzugefügt</div> : <div className="text-center text-white p-8">Keine Berechtigung</div>} />
        <Route path="/zug" element={hasPermission("zug") ? <div className="text-center text-white p-8">Zug - Wird später hinzugefügt</div> : <div className="text-center text-white p-8">Keine Berechtigung</div>} />
        <Route path="/profile" element={<Profile user={user} />} />
        {user.is_admin && <Route path="/admin" element={<AdminPanel />} />}
      </Routes>
    </div>
  );
}