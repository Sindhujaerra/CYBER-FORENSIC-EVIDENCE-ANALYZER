import { useEffect, useState } from "react";

export default function ThreatPanel({ timeline }: any) {
  const [threat, setThreat] = useState("LOW");

  useEffect(() => {
    if (!timeline) return;

    const tampered = timeline.filter((e: any) =>
      e.eventType?.toUpperCase().includes("TAMPERED")
    );

    if (tampered.length > 3) setThreat("HIGH");
    else if (tampered.length > 0) setThreat("MEDIUM");
    else setThreat("LOW");
  }, [timeline]);

  const color =
    threat === "HIGH"
      ? "text-red-500"
      : threat === "MEDIUM"
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-red-500/20 rounded-xl p-5 animate-pulse">
      <h2 className="text-lg text-red-400 mb-2">⚠ Threat Detection</h2>
      <p className={`text-3xl font-bold ${color}`}>{threat}</p>
    </div>
  );
}
