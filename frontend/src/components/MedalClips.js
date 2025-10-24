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
              <div key={clip.contentId} className="rdr-card overflow-hidden" style={{ padding: 0 }}>
                <div 
                  dangerouslySetInnerHTML={{ __html: clip.embedIframeCode }}
                  style={{ 
                    width: '100%', 
                    aspectRatio: '16/9',
                    overflow: 'hidden'
                  }}
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
              <div key={clip.contentId} className="rdr-card overflow-hidden" style={{ padding: 0 }}>
                <div 
                  dangerouslySetInnerHTML={{ __html: clip.embedIframeCode }}
                  style={{ 
                    width: '100%', 
                    aspectRatio: '16/9',
                    overflow: 'hidden'
                  }}
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
