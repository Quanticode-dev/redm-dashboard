import { useState, useEffect } from "react";
import axios from "axios";

const MEDAL_API_KEY = "pub_mXEadtO97REnSauc5K6fv81Tae7ZaB2T";
const MEDAL_SEARCH_URL = "https://developers.medal.tv/v1/search";

export default function MedalClips() {
  const [clips, setClips] = useState({
    quxntwxn: [],
    krokofox: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    try {
      const users = ["quxntwxn", "krokofox"];
      const clipsData = {};

      for (const username of users) {
        try {
          // Search for clips mentioning the username (without category filter)
          const response = await axios.get(MEDAL_SEARCH_URL, {
            headers: {
              "Authorization": MEDAL_API_KEY,
              "Content-Type": "application/json"
            },
            params: {
              text: username,
              limit: 50,
              width: 640,
              height: 360,
              autoplay: 0,
              muted: 1
            }
          });

          // Filter to get clips from the specific user
          const userClips = response.data.contentObjects
            .filter(clip => {
              const creditsLower = (clip.credits || "").toLowerCase();
              const urlMatch = creditsLower.includes(`medal.tv/users/${username.toLowerCase()}`);
              const nameMatch = creditsLower.includes(username.toLowerCase());
              return urlMatch || nameMatch;
            })
            .slice(0, 3);

          clipsData[username] = userClips;
        } catch (err) {
          console.error(`Error fetching clips for ${username}:`, err);
          clipsData[username] = [];
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
    <div className="max-w-7xl mx-auto px-8 pb-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#f4e8d0' }}>
        🎮 Neueste Medal Clips
      </h2>

      {/* quxntwxn Clips */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#d4c5a9' }}>
          <span>👤</span> quxntwxn
        </h3>
        {clips.quxntwxn.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clips.quxntwxn.map((clip) => (
              <div key={clip.contentId} className="rdr-card overflow-hidden">
                <div 
                  dangerouslySetInnerHTML={{ __html: clip.embedIframeCode }}
                  className="w-full"
                />
                <div className="p-3">
                  <p className="font-semibold text-sm line-clamp-2" style={{ color: '#3d2f1f' }}>
                    {clip.contentTitle || "Untitled"}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#6d5838' }}>
                    <span>👁️ {clip.contentViews.toLocaleString()}</span>
                    <span>❤️ {clip.contentLikes}</span>
                    <span>⏱️ {clip.videoLengthSeconds}s</span>
                  </div>
                  <a 
                    href={clip.directClipUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs mt-2 inline-block hover:underline"
                    style={{ color: '#8b7355' }}
                  >
                    Auf Medal.tv ansehen →
                  </a>
                </div>
              </div>
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
          <span>👤</span> krokofox
        </h3>
        {clips.krokofox.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clips.krokofox.map((clip) => (
              <div key={clip.contentId} className="rdr-card overflow-hidden">
                <div 
                  dangerouslySetInnerHTML={{ __html: clip.embedIframeCode }}
                  className="w-full"
                />
                <div className="p-3">
                  <p className="font-semibold text-sm line-clamp-2" style={{ color: '#3d2f1f' }}>
                    {clip.contentTitle || "Untitled"}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#6d5838' }}>
                    <span>👁️ {clip.contentViews.toLocaleString()}</span>
                    <span>❤️ {clip.contentLikes}</span>
                    <span>⏱️ {clip.videoLengthSeconds}s</span>
                  </div>
                  <a 
                    href={clip.directClipUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs mt-2 inline-block hover:underline"
                    style={{ color: '#8b7355' }}
                  >
                    Auf Medal.tv ansehen →
                  </a>
                </div>
              </div>
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
