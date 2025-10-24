import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import Hunter from "./Hunter";
import Profile from "./Profile";
import AdminPanel from "./AdminPanel";
import MapView from "./MapView";
import Zug from "./Zug";
import { LogOut, User, Shield, Menu, X } from "lucide-react";
import axios from "axios";
import { useState } from "react";

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 leather-texture border-b-4 border-[#8b7355] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#f4e8d0', fontFamily: 'Pirata One, cursive' }}>Hunter Dashboard</h1>
            <p className="text-xs md:text-sm" style={{ color: '#d4c5a9' }}>Willkommen, {user.display_name || user.username}</p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              data-testid="dashboard-button"
              onClick={() => navigate("/")}
              className="rdr-button flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Dashboard
            </Button>
            
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

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: '#f4e8d0' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <Button
              onClick={() => { navigate("/"); setMobileMenuOpen(false); }}
              className="rdr-button w-full flex items-center justify-start gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Dashboard
            </Button>
            
            <Button
              onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}
              className="rdr-button w-full flex items-center justify-start gap-2"
            >
              <User size={16} />
              Profil
            </Button>
            
            {user.is_admin && (
              <Button
                onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                className="rdr-button w-full flex items-center justify-start gap-2"
              >
                <Shield size={16} />
                Admin
              </Button>
            )}
            
            <Button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="rdr-button w-full flex items-center justify-start gap-2"
            >
              <LogOut size={16} />
              Abmelden
            </Button>
          </div>
        )}
      </header>

      {/* Spacer for fixed navbar */}
      <div style={{ height: '92px' }}></div>

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
        <Route path="/map" element={hasPermission("map") ? <div style={{ height: 'calc(100vh - 92px)', overflow: 'hidden', position: 'relative' }}><MapView user={user} /></div> : <div className="text-center text-white p-8">Keine Berechtigung</div>} />
        <Route path="/zug" element={hasPermission("zug") ? <Zug user={user} /> : <div className="text-center text-white p-8">Keine Berechtigung</div>} />
        <Route path="/profile" element={<Profile user={user} />} />
        {user.is_admin && <Route path="/admin" element={<AdminPanel />} />}
      </Routes>
    </div>
  );
}