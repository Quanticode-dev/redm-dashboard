import { useState, useEffect } from "react";
import axios from "axios";

const MEDAL_API_KEY = "pub_mXEadtO97REnSauc5K6fv81Tae7ZaB2T";
const MEDAL_LATEST_URL = "https://developers.medal.tv/v1/latest";

export default function MedalClips() {
  const [clips, setClips] = useState({
    quxntwxn: [],
    krokofox: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClips();
  }, []);

  // Format seconds to MM:SS
  const formatDuration = (seconds) => {
    const totalSeconds = Math.floor(seconds); // Ensure integer
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchClips = async () => {
    try {
      const users = [
        { username: "quxntwxn", userId: "406391704" },
        { username: "krokofox", userId: "467149053" }
      ];

      const clipsData = {};

      for (const user of users) {
        try {
          if (user.userId) {
            // Use latest API with userId
            const response = await axios.get(MEDAL_LATEST_URL, {
              headers: {
                "Authorization": MEDAL_API_KEY,
                "Content-Type": "application/json"
              },
              params: {
                userId: user.userId,
                limit: 3,
                width: 640,
                height: 360,
                autoplay: 0,
                muted: 1
              }
            });

            clipsData[user.username] = response.data.contentObjects || [];
          } else {
            // Fallback to search for users without userId
            const searchUrl = "https://developers.medal.tv/v1/search";
            const response = await axios.get(searchUrl, {
              headers: {
                "Authorization": MEDAL_API_KEY,
                "Content-Type": "application/json"
              },
              params: {
                text: user.username,
                limit: 50,
                width: 640,
                height: 360,
                autoplay: 0,
                muted: 1
              }
            });

            const userClips = response.data.contentObjects
              .filter(clip => {
                const creditsLower = (clip.credits || "").toLowerCase();
                return creditsLower.includes(user.username.toLowerCase());
              })
              .slice(0, 3);

            clipsData[user.username] = userClips;
          }
        } catch (err) {
          console.error(`Error fetching clips for ${user.username}:`, err);
          clipsData[user.username] = [];
        }
      }

      setClips(clipsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Medal clips:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8" style={{ color: '#f4e8d0' }}>
        Lade Clips...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 pb-8 pt-12">
      <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#f4e8d0' }}>
        Neueste Clips
      </h2>

      {/* quxntwxn Clips */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#d4c5a9' }}>
          <span>👤</span> Quantwan
        </h3>
        {clips.quxntwxn.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clips.quxntwxn.map((clip) => (
              <a
                key={clip.contentId} 
                href={clip.directClipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rdr-card overflow-hidden hover:scale-105 transition-transform duration-200" 
                style={{ padding: 0, display: 'block', textDecoration: 'none' }}
              >
                <div 
                  style={{ 
                    width: '100%', 
                    aspectRatio: '16/9',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundImage: `url(${clip.contentThumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Play button overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#fff'
                  }}>
                    ▶
                  </div>
                  {/* Duration badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.8)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {formatDuration(clip.videoLengthSeconds)}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm line-clamp-2" style={{ color: '#3d2f1f' }}>
                    {clip.contentTitle || "Untitled"}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#6d5838' }}>
                    <span>👁️ {clip.contentViews.toLocaleString()}</span>
                    <span>❤️ {clip.contentLikes}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rdr-card text-center py-8" style={{ color: '#8b7355' }}>
            Keine Clips gefunden
          </div>
        )}
      </div>

      {/* krokofox Clips */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#d4c5a9' }}>
          <span>👤</span> KroKoFox
        </h3>
        {clips.krokofox.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clips.krokofox.map((clip) => (
              <a
                key={clip.contentId} 
                href={clip.directClipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rdr-card overflow-hidden hover:scale-105 transition-transform duration-200" 
                style={{ padding: 0, display: 'block', textDecoration: 'none' }}
              >
                <div 
                  style={{ 
                    width: '100%', 
                    aspectRatio: '16/9',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundImage: `url(${clip.contentThumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Play button overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#fff'
                  }}>
                    ▶
                  </div>
                  {/* Duration badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.8)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {formatDuration(clip.videoLengthSeconds)}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm line-clamp-2" style={{ color: '#3d2f1f' }}>
                    {clip.contentTitle || "Untitled"}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#6d5838' }}>
                    <span>👁️ {clip.contentViews.toLocaleString()}</span>
                    <span>❤️ {clip.contentLikes}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rdr-card text-center py-8" style={{ color: '#8b7355' }}>
            Keine Clips gefunden
          </div>
        )}
      </div>
    </div>
  );
}
