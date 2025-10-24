import { useState, useEffect } from "react";

export default function Zug({ user }) {
  const [expandedRoutes, setExpandedRoutes] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const toggleRoute = (routeId) => {
    setExpandedRoutes(prev => ({
      ...prev,
      [routeId]: !prev[routeId]
    }));
  };

  // Hardcoded routes data
  const routes = [
    {
      id: 1,
      title: "/g1 - Kleine Runde [SD➸EM➸OIL➸VAL➸RHO➸SD]",
      time: "[20min]",
      stations: ["sw SD", null, "EM", null, "OIL", null, "VAL", null, "RHO", null, "SD"],
      data: ["R", "", "L", "R", "", "", "", "L", "", "", "R ❘ L"]
    },
    {
      id: 2,
      title: "/g2 - Große Runde [SD➸VH➸AB➸BCC➸WLL➸RGG➸G1➸FLT➸RHO➸SD]",
      time: "[40min]",
      stations: ["no SD", null, "VH", null, "AB", null, "BCC", null, "WLL", null, "RGG", null, "G1", null, "FLT", null, "RHO", null, "SD"],
      data: ["", "R", "", "", "20 R", "40", "L 10", "40", "", "L ❘ R", "", "L", "", "", "R", "", "", "", "R ❘ L"]
    },
    {
      id: 3,
      title: "/g3 - Mega Runde [SD-VH-AB-BCC-WLL-RGG-G1-MZ-MAC-G2-AD-BP-AD-MAC-BW-G1-FLT-RHO-SD]",
      time: "[XXmin]",
      stations: ["no SD", null, "VH", null, "AB", null, "BCC", null, "WLL", null, "RGG", null, "G1", null, "MZ", null, "MAC", null, "G2", null, "AD", null, "BP", null, "AD", null, "MAC", null, "BW", null, "G1", null, "FLT", null, "RHO", null, "SD"],
      data: ["", "R", "", "", "20 R", "40", "L 10", "40", "", "L ❘ R", "", "", "L ➸ R", "", "", "30 Tu", "", "R ➸ L", "L", "", "", "25 R", "", "R 25", "", "", "", "R ➸ R", "20", "", "R ➸ R", "", "R", "", "", "", "R ❘ L"]
    },
    {
      id: 4,
      title: "/g4 - Zentral Runde [SD-EM-OIL-VAL-FLT-G1-MZ-MAC-BW-G1-FLT-RHO-SD]",
      time: "[XXmin]",
      stations: ["sw SD", null, "EM", null, "OIL", null, "VAL", null, "FLT", null, "G1", null, "MZ", null, "MAC", null, "BW", null, "G1", null, "FLT", null, "RHO", null, "SD"],
      data: ["R", "", "L", "", "R", "", "", "R", "", "", "L ➸ R", "", "", "30 Tu", "", "R ➸ R", "20", "", "R ➸ R", "", "R", "", "", "", "R ❘ L"]
    },
    {
      id: 5,
      title: "/g5 - West Runde [BW-MZ-MAC-G2-AD-BP-AD-MAC-BW]",
      time: "[40min]",
      stations: ["n BW", null, "MZ", null, "MAC", null, "G2", null, "AD", null, "BP", null, "AD", null, "MAC", null, "BW"],
      data: ["20", "L", "", "30 Tu", "", "R ➸ L", "L", "", "", "25 R", "", "R 25", "", "", "", "R ➸ R", "20"]
    },
    {
      id: 6,
      title: "/g6 - !TEST! Ost Runde [SD-VH-AB-BCC-WLL-RGG-G1-MZ-MAC-BW-G1-FLT-RHO-SD]",
      time: "[XXmin]",
      stations: ["no SD", null, "VH", null, "AB", null, "BCC", null, "WLL", null, "RGG", null, "G1", null, "MZ", null, "MAC", null, "BW", null, "G1", null, "FLT", null, "RHO", null, "SD"],
      data: ["", "R", "", "", "20 R", "40", "L 10", "40", "", "L ❘ R", "", "", "L ➸ R", "", "", "30 Tu", "", "R ➸ R", "20", "", "R ➸ R", "", "R", "", "", "", "L ❘ R"]
    },
    {
      id: 7,
      title: "/g7 - !TEST! Östliche Zentralrunde [SD-OIL-VAL-FLT-G1-MZ-MAC-BW-G1-FLT-RHO-SD]",
      time: "[XXmin]",
      stations: ["no SD", null, "OIL", null, "VAL", null, "FLT", null, "G1", null, "MZ", null, "MAC", null, "BW", null, "G1", null, "FLT", null, "RHO", null, "SD"],
      data: ["", "L ➸ R", "", "", "", "R", "", "", "L ➸ R", "", "", "30 Tu", "", "R ➸ R", "20", "", "R ➸ R", "", "R", "", "", "", "L ❘ R"]
    },
    {
      id: 8,
      title: "/g8 - Kleine BW Ost Runde [BW-G1-FLT-RHO-SD-OIL-VAL-FLT-G1-BW]",
      time: "[XXmin]",
      stations: ["n BW", null, "G1", null, "FLT", null, "RHO", null, "SD", null, "OIL", null, "VAL", null, "FLT", null, "G1", null, "BW"],
      data: ["20", "", "R ➸ R", "", "R", "", "", "", "L ❘ R", "L ➸ R", "", "", "", "R", "", "", "L ➸ L", "", "20"]
    },
    {
      id: 9,
      title: "/g9 - !TEST! Große Black Water Ost Runde [BW-G1-FLT-RHO-SD-VH-AB-BCC-WLL-RGG-G1-BW]",
      time: "[XXmin]",
      stations: ["n BW", null, "G1", null, "FLT", null, "RHO", null, "SD", null, "VH", null, "AB", null, "BCC", null, "WLL", null, "RGG", null, "G1", null, "BW"],
      data: ["20", "", "R>R", "", "R", "", "", "", "L|R", "R", "", "", "20R", "40", "L 10", "40", "", "L|R", "", "", "R>L", "", "20"]
    },
    {
      id: 10,
      title: "Benutzer - Black Water ➸ Saint Denise [BW-G1-FLT-RHO-SD]",
      time: "[15min]",
      stations: ["n BW", null, "G1", null, "FLT", null, "RHO", null, "SD"],
      data: ["20", "", "R ➸ R", "", "R", "", "", "", "R ❘ L"]
    },
    {
      id: 11,
      title: "Benutzer - Saint Denise ➸ Black Water [SD-OIL-VAL-FLT-G1-BW]",
      time: "[20min]",
      stations: ["no SD", null, "OIL", null, "VAL", null, "FLT", null, "G1", null, "BW"],
      data: ["", "L ➸ R", "", "", "", "R", "", "", "L ➸ L", "", "20"]
    }
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: '#2a2419',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {/* Legende - oben links wie bei der Map */}
      <div className="absolute top-4 left-4 rdr-card p-4" style={{ maxWidth: '300px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', zIndex: 1000 }}>
        <h3 className="font-bold mb-2" style={{ color: '#3d2f1f', fontFamily: 'Chinese Rocks, cursive', fontSize: '18px' }}>
          Whitmore Railroads
        </h3>
        <p className="text-xs mb-3" style={{ color: '#6d5838' }}>
          {formatTime(currentTime)}
        </p>
        <h3 className="font-bold mb-2" style={{ color: '#3d2f1f' }}>Routen</h3>
        <div className="space-y-1 text-xs" style={{ color: '#6d5838' }}>
          {routes.map((route, index) => (
            <button
              key={route.id}
              onClick={() => toggleRoute(route.id)}
              className="w-full text-left px-2 py-1 rounded hover:bg-opacity-70 transition-colors"
              style={{
                background: expandedRoutes[route.id] ? 'rgba(139, 115, 85, 0.3)' : 'transparent',
                border: expandedRoutes[route.id] ? '1px solid #8b7355' : '1px solid transparent',
                color: '#3d2f1f',
                fontWeight: expandedRoutes[route.id] ? 'bold' : 'normal'
              }}
            >
              {expandedRoutes[route.id] ? '▼' : '▶'} {route.title.split(' - ').slice(1).join(' - ')}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollbarer Routen-Container */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '24px',
        paddingLeft: '360px' // Mehr Platz für die Legende
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {routes.map((route) => (
          <table key={route.id} style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '1px',
            tableLayout: 'fixed',
            background: 'transparent',
            marginBottom: '24px'
          }}>
            <tbody>
              {/* Title Row - No toggle button */}
              <tr style={{ background: 'transparent' }}>
                <td colSpan="25" style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#f4e8d0',
                  fontSize: '20px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  padding: '10px 12px'
                }}>
                  <b>{route.title} - <font color="#d4c5a9">{route.time}</font></b>
                </td>
              </tr>

              {/* Stations Row */}
              {expandedRoutes[route.id] && (
                <>
                  <tr>
                    {route.stations.map((station, idx) => (
                      <td key={idx} style={{
                        border: '1px solid #8b7355',
                        padding: '0',
                        textAlign: 'center',
                        height: '40px',
                        verticalAlign: 'middle',
                        fontSize: 'clamp(12.5px, 1.375vw, 17.5px)',
                        whiteSpace: 'nowrap',
                        borderRadius: '4px',
                        background: 'rgba(199, 168, 106, 0.3)',
                        overflow: 'hidden',
                        fontWeight: 'bold',
                        color: '#f4e8d0'
                      }}>
                        {station === null ? (
                          <img 
                            src="https://customer-assets.emergentagent.com/job_huntersdashboard/artifacts/q9td7fj2_gleis.png" 
                            alt="Gleis"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block'
                            }}
                          />
                        ) : (
                          station
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Data Row */}
                  <tr>
                    {route.data.map((cell, idx) => (
                      <td key={idx} style={{
                        border: '1px solid #8b7355',
                        padding: '0',
                        textAlign: 'center',
                        height: '40px',
                        verticalAlign: 'middle',
                        fontSize: 'clamp(12.5px, 1.375vw, 17.5px)',
                        whiteSpace: 'nowrap',
                        borderRadius: '4px',
                        background: 'rgba(199, 168, 106, 0.2)',
                        overflow: 'hidden',
                        color: '#d4c5a9',
                        fontWeight: 'bold'
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        ))}
        </div>
      </div>
    </div>
  );
}
