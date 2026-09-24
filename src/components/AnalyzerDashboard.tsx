import { useEffect, useState } from "react";
import axios from "axios";

export default function AnalyzerDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axios
      .get("/api/analyzer/dashboard")
      .then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Loading Analyzer...</p>;

  return (
    <div className="grid grid-cols-3 gap-6">

      <div className="bg-slate-900 p-6 rounded-lg">
        <h2>Total Files</h2>
        <p className="text-2xl">{stats.totalFiles}</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg">
        <h2>Images</h2>
        <p className="text-2xl">{stats.images}</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg">
        <h2>Videos</h2>
        <p className="text-2xl">{stats.videos}</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg">
        <h2>Audio</h2>
        <p className="text-2xl">{stats.audio}</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg">
        <h2>Documents</h2>
        <p className="text-2xl">{stats.documents}</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-lg">
        <h2>Total Size</h2>
        <p className="text-2xl">{(stats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
      </div>

    </div>
  );
}