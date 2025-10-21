import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Save } from "lucide-react";

export default function Zug({ user }) {
  const [routes, setRoutes] = useState([]);
  const [expandedRoutes, setExpandedRoutes] = useState({});
  const [editingRoute, setEditingRoute] = useState(null);
  const [editedData, setEditedData] = useState(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const res = await axios.get(`${API}/zug/routes`);
      setRoutes(res.data);
      
      // If no routes exist and user is admin, initialize them
      if (res.data.length === 0 && user.is_admin) {
        await axios.post(`${API}/zug/routes/init`);
        const newRes = await axios.get(`${API}/zug/routes`);
        setRoutes(newRes.data);
      }
    } catch (err) {
      console.error("Error loading routes:", err);
      if (err.response?.status === 403) {
        toast.error("Keine Berechtigung für Zug-Bereich");
      }
    }
  };

  const toggleRoute = (routeId) => {
    setExpandedRoutes(prev => ({
      ...prev,
      [routeId]: !prev[routeId]
    }));
  };

  const startEditing = (route) => {
    setEditingRoute(route.id);
    setEditedData({
      title: route.title,
      stations: [...route.stations],
      rows: route.rows.map(row => [...row])
    });
  };

  const cancelEditing = () => {
    setEditingRoute(null);
    setEditedData(null);
  };

  const updateCell = (rowIndex, colIndex, value) => {
    setEditedData(prev => {
      const newRows = [...prev.rows];
      newRows[rowIndex] = [...newRows[rowIndex]];
      newRows[rowIndex][colIndex] = value;
      return { ...prev, rows: newRows };
    });
  };

  const updateTitle = (value) => {
    setEditedData(prev => ({ ...prev, title: value }));
  };

  const updateStation = (index, value) => {
    setEditedData(prev => {
      const newStations = [...prev.stations];
      newStations[index] = value;
      return { ...prev, stations: newStations };
    });
  };

  const saveRoute = async (routeId) => {
    try {
      await axios.put(`${API}/zug/routes/${routeId}`, editedData);
      toast.success("Route gespeichert");
      setEditingRoute(null);
      setEditedData(null);
      loadRoutes();
    } catch (err) {
      console.error("Error saving route:", err);
      toast.error("Fehler beim Speichern");
    }
  };

  const isEditing = (routeId) => editingRoute === routeId;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8" style={{ color: '#f4e8d0' }}>
        Zug - Routen
      </h2>

      <div className="space-y-4">
        {routes.length === 0 ? (
          <div className="text-center text-white p-8">
            Keine Routen verfügbar. Bitte initialisieren Sie die Routen.
          </div>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="rdr-parchment-tile">
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-80"
                onClick={() => !isEditing(route.id) && toggleRoute(route.id)}
              >
                <div className="flex-1">
                  {isEditing(route.id) ? (
                    <Input
                      value={editedData.title}
                      onChange={(e) => updateTitle(e.target.value)}
                      className="rdr-input font-bold"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className="font-bold text-lg" style={{ color: '#3d2f1f' }}>
                      {route.title}
                    </h3>
                  )}
                </div>
              
              <div className="flex items-center gap-2">
                {user.is_admin && (
                  <>
                    {isEditing(route.id) ? (
                      <>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveRoute(route.id);
                          }}
                          className="rdr-button flex items-center gap-2"
                        >
                          <Save size={16} />
                          Speichern
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditing();
                          }}
                          className="rdr-button"
                          style={{ background: 'linear-gradient(to bottom, #8b4513 0%, #6b3410 100%)' }}
                        >
                          Abbrechen
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(route);
                        }}
                        className="rdr-button"
                      >
                        Bearbeiten
                      </Button>
                    )}
                  </>
                )}
                <button className="text-[#3d2f1f]">
                  {expandedRoutes[route.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {/* Table */}
            {expandedRoutes[route.id] && (
              <div className="px-4 pb-4 overflow-x-auto">
                <table className="w-full border-collapse" style={{ minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(139, 115, 85, 0.2)' }}>
                      <th className="border-2 border-[#8b7355] p-2 text-left" style={{ color: '#3d2f1f', width: '60px' }}>
                        #
                      </th>
                      {(isEditing(route.id) ? editedData.stations : route.stations).map((station, idx) => (
                        <th key={idx} className="border-2 border-[#8b7355] p-2 text-center" style={{ color: '#3d2f1f' }}>
                          {isEditing(route.id) ? (
                            <Input
                              value={station}
                              onChange={(e) => updateStation(idx, e.target.value)}
                              className="rdr-input text-center font-bold"
                              style={{ minWidth: '60px' }}
                            />
                          ) : (
                            <span className="font-bold">{station}</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(isEditing(route.id) ? editedData.rows : route.rows).map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="border-2 border-[#8b7355] p-2 text-center font-bold" style={{ color: '#6d5838' }}>
                          {rowIdx + 1}
                        </td>
                        {row.map((cell, colIdx) => (
                          <td key={colIdx} className="border-2 border-[#8b7355] p-1">
                            {isEditing(route.id) ? (
                              <Input
                                value={cell}
                                onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                                className="rdr-input text-center"
                                style={{ minWidth: '60px', padding: '4px' }}
                              />
                            ) : (
                              <div className="text-center" style={{ color: '#8b4513', fontWeight: '600', minHeight: '24px' }}>
                                {cell}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
        )}
      </div>
    </div>
  );
}
