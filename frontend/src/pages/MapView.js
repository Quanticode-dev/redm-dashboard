import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function MapView({ user }) {
  const [markers, setMarkers] = useState([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMarkerForm, setShowMarkerForm] = useState(false);
  const [markerFormPosition, setMarkerFormPosition] = useState({ x: 0, y: 0 });
  const [editingMarker, setEditingMarker] = useState(null);
  const [markerData, setMarkerData] = useState({
    name: "",
    type: "person",
    is_friendly: true,
    map_x: 0,
    map_y: 0
  });
  
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const getMarkerColor = (type) => {
    switch(type) {
      case 'person': return '#3b82f6'; // Blau
      case 'gebaeude': return '#22c55e'; // Grün
      case 'ankauf': return '#eab308'; // Gelb
      case 'abbau': return '#f97316'; // Orange
      default: return '#3b82f6';
    }
  };

  const getMarkerLabel = (type) => {
    switch(type) {
      case 'person': return 'Person';
      case 'gebaeude': return 'Gebäude';
      case 'ankauf': return 'Ankauf';
      case 'abbau': return 'Abbau';
      default: return type;
    }
  };

  useEffect(() => {
    loadMarkers();
  }, []);

  const loadMarkers = async () => {
    try {
      const res = await axios.get(`${API}/map/markers`);
      setMarkers(res.data);
    } catch (err) {
      console.error("Error loading markers:", err);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 3);
    
    // Zoom towards mouse position
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scaleChange = newScale / scale;
    const newX = mouseX - (mouseX - position.x) * scaleChange;
    const newY = mouseY - (mouseY - position.y) * scaleChange;
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    
    // Check if clicking on an existing marker
    const clickedMarker = findMarkerAtPosition(e);
    
    if (clickedMarker) {
      // Edit existing marker
      setEditingMarker(clickedMarker);
      setMarkerData({
        name: clickedMarker.name,
        type: clickedMarker.type,
        is_friendly: clickedMarker.is_friendly,
        map_x: clickedMarker.map_x,
        map_y: clickedMarker.map_y
      });
    } else {
      // Create new marker
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      
      setEditingMarker(null);
      setMarkerData({
        name: "",
        type: "person",
        is_friendly: true,
        map_x: x,
        map_y: y
      });
    }
    
    setMarkerFormPosition({ x: e.clientX, y: e.clientY });
    setShowMarkerForm(true);
  };

  const findMarkerAtPosition = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - position.x) / scale;
    const clickY = (e.clientY - rect.top - position.y) / scale;
    
    return markers.find(marker => {
      const distance = Math.sqrt(
        Math.pow(marker.map_x - clickX, 2) + 
        Math.pow(marker.map_y - clickY, 2)
      );
      return distance < 20; // 20px radius
    });
  };

  const handleSaveMarker = async () => {
    if (!markerData.name) {
      toast.error("Name ist erforderlich");
      return;
    }

    try {
      if (editingMarker) {
        // Update existing marker
        await axios.put(`${API}/map/markers/${editingMarker.id}`, markerData);
        toast.success("Marker aktualisiert");
      } else {
        // Create new marker
        await axios.post(`${API}/map/markers`, markerData);
        toast.success("Marker erstellt");
      }
      
      setShowMarkerForm(false);
      setMarkerData({ name: "", type: "person", is_friendly: true, map_x: 0, map_y: 0 });
      setEditingMarker(null);
      loadMarkers();
    } catch (err) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleDeleteMarker = async () => {
    if (!editingMarker) return;
    
    try {
      await axios.delete(`${API}/map/markers/${editingMarker.id}`);
      toast.success("Marker gelöscht");
      setShowMarkerForm(false);
      setEditingMarker(null);
      loadMarkers();
    } catch (err) {
      toast.error("Fehler beim Löschen");
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden relative" style={{ background: '#2a2419' }}>
      <div
        ref={containerRef}
        className="w-full h-full cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <div
          ref={mapRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: '2048px',
            height: '2048px',
            position: 'absolute',
            backgroundImage: 'url(https://customer-assets.emergentagent.com/job_hunterdash/artifacts/pcgsxul4_map_rdr2.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {markers.map((marker) => (
            <div
              key={marker.id}
              data-testid={`marker-${marker.id}`}
              style={{
                position: 'absolute',
                left: `${marker.map_x}px`,
                top: `${marker.map_y}px`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer'
              }}
            >
              {/* Pin */}
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: getMarkerColor(marker.type),
                  border: '2px solid #000',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              />
              {/* Label */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: marker.is_friendly ? '#f4e8d0' : '#ef4444',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: '1px solid rgba(139, 115, 85, 0.5)',
                  pointerEvents: 'none'
                }}
              >
                {marker.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 rdr-card p-4" style={{ maxWidth: '250px' }}>
        <h3 className="font-bold mb-2" style={{ color: '#3d2f1f' }}>Steuerung</h3>
        <ul className="text-xs space-y-1 mb-3" style={{ color: '#6d5838' }}>
          <li>• <strong>Rechtsklick:</strong> Marker hinzufügen/bearbeiten</li>
          <li>• <strong>Linksklick + Ziehen:</strong> Karte bewegen</li>
          <li>• <strong>Mausrad:</strong> Zoom</li>
          <li>• <strong>Zoom:</strong> {Math.round(scale * 100)}%</li>
        </ul>
        <h3 className="font-bold mb-2 mt-3" style={{ color: '#3d2f1f' }}>Legende</h3>
        <div className="space-y-1 text-xs" style={{ color: '#6d5838' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', border: '2px solid #000' }} />
            <span>Person</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid #000' }} />
            <span>Gebäude</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308', border: '2px solid #000' }} />
            <span>Ankauf</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316', border: '2px solid #000' }} />
            <span>Abbau</span>
          </div>
        </div>
      </div>
    </div>

      {/* Marker Form */}
      {showMarkerForm && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMarkerForm(false)}
          />
          <div
            className="fixed z-50 rdr-card p-4"
            style={{
              left: `${Math.min(markerFormPosition.x, window.innerWidth - 300)}px`,
              top: `${Math.min(markerFormPosition.y, window.innerHeight - 400)}px`,
              width: '280px'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold" style={{ color: '#3d2f1f' }}>
                {editingMarker ? 'Marker Bearbeiten' : 'Neuer Marker'}
              </h3>
              <button onClick={() => setShowMarkerForm(false)}>
                <X size={16} style={{ color: '#3d2f1f' }} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label style={{ color: '#3d2f1f' }}>Name</Label>
                <Input
                  data-testid="marker-name-input"
                  value={markerData.name}
                  onChange={(e) => setMarkerData({ ...markerData, name: e.target.value })}
                  className="rdr-input"
                  placeholder="z.B. Saloon"
                />
              </div>

              <div>
                <Label style={{ color: '#3d2f1f' }}>Typ</Label>
                <Select
                  value={markerData.type}
                  onValueChange={(value) => setMarkerData({ ...markerData, type: value })}
                >
                  <SelectTrigger className="rdr-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rdr-card">
                    <SelectItem value="person">Person</SelectItem>
                    <SelectItem value="gebaeude">Gebäude</SelectItem>
                    <SelectItem value="ankauf">Ankauf</SelectItem>
                    <SelectItem value="abbau">Abbau</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="marker-friendly"
                  data-testid="marker-friendly-checkbox"
                  checked={markerData.is_friendly}
                  onChange={(e) => setMarkerData({ ...markerData, is_friendly: e.target.checked })}
                  className="w-4 h-4 rounded border-2 border-[#8b7355] cursor-pointer"
                  style={{ accentColor: '#8b7355' }}
                />
                <Label htmlFor="marker-friendly" style={{ color: '#3d2f1f' }}>
                  Friendly
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  data-testid="save-marker-button"
                  onClick={handleSaveMarker}
                  className="rdr-button flex-1"
                >
                  Speichern
                </Button>
                {editingMarker && (
                  <Button
                    data-testid="delete-marker-button"
                    onClick={handleDeleteMarker}
                    className="rdr-button"
                    style={{ background: 'linear-gradient(to bottom, #8b4513 0%, #6b3410 100%)' }}
                  >
                    Löschen
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
