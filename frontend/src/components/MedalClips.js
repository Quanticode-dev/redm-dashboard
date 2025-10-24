import { useState, useEffect } from "react";
import axios from "axios";

const MEDAL_API_KEY = "pub_mXEadtO97REnSauc5K6fv81Tae7ZaB2T";
const MEDAL_API_URL = "https://developers.medal.tv/v1/latest";
const CATEGORY_ID = "2gEBKR396v"; // Red Dead Redemption 2

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
      // Fetch clips for both users
      const users = [
        { username: "quxntwxn", userId: "quxntwxn" }, // We'll need to get the actual user IDs
        { username: "krokofox", userId: "krokofox" }
      ];

      const clipsData = {};

      for (const user of users) {
        try {
          // First, let's try to search by username to get clips
          const response = await axios.get(MEDAL_API_URL, {
            headers: {
              "Authorization": MEDAL_API_KEY,
              "Content-Type": "application/json"
            },
            params: {
              categoryId: CATEGORY_ID,
              limit: 100 // Get more to filter by user
            }
          });

          // Filter clips by username in the credits field
          const userClips = response.data.contentObjects.filter(clip => 
            clip.credits && clip.credits.toLowerCase().includes(user.username.toLowerCase())
          ).slice(0, 3);

          clipsData[user.username] = userClips;
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
        Neueste Medal Clips
      </h2>

      {/* quxntwxn Clips */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#d4c5a9' }}>
          quxntwxn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clips.quxntwxn.length > 0 ? (
            clips.quxntwxn.map((clip) => (
              <div key={clip.contentId} className="rdr-card overflow-hidden">
                <div 
                  dangerouslySetInnerHTML={{ __html: clip.embedIframeCode }}
                  style={{ width: '100%', aspectRatio: '16/9' }}
                />
                <div className="p-3">
                  <p className="font-semibold text-sm" style={{ color: '#3d2f1f' }}>
                    {clip.contentTitle}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6d5838' }}>
                    👁️ {clip.contentViews} • ❤️ {clip.contentLikes}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4" style={{ color: '#8b7355' }}>
              Keine Clips gefunden
            </div>
          )}
        </div>
      </div>

      {/* krokofox Clips */}
      <div>
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#d4c5a9' }}>
          krokofox
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clips.krokofox.length > 0 ? (
            clips.krokofox.map((clip) => (
              <div key={clip.contentId} className="rdr-card overflow-hidden">
                <div 
                  dangerouslySetInnerHTML={{ __html: clip.embedIframeCode }}
                  style={{ width: '100%', aspectRatio: '16/9' }}
                />
                <div className="p-3">
                  <p className="font-semibold text-sm" style={{ color: '#3d2f1f' }}>
                    {clip.contentTitle}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6d5838' }}>
                    👁️ {clip.contentViews} • ❤️ {clip.contentLikes}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4" style={{ color: '#8b7355' }}>
              Keine Clips gefunden
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
