import { useState } from "react";

export default function Terminal({ timeline }: any) {
  const [logs, setLogs] = useState<string[]>([]);

  const runCommand = () => {
    const newLogs = timeline.map(
      (e: any) => `[${e.eventType}] ${e.description}`
    );
    setLogs(newLogs);
  };

  return (
    <div className="bg-black text-green-400 p-4 rounded-xl font-mono border border-green-500/20">
      <button onClick={runCommand} className="mb-3 bg-green-600 px-3 py-1 rounded">
        Run Scan
      </button>
      <div className="h-40 overflow-y-auto text-sm">
        {logs.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
    </div>
  );
}
