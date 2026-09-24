import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function FileChart({ files }: any) {
  const dataMap: any = {};
  files.forEach((f: any) => {
    const ext = f.metadata?.extension || "unknown";
    dataMap[ext] = (dataMap[ext] || 0) + 1;
  });

  const data = Object.keys(dataMap).map((key) => ({
    name: key,
    value: dataMap[key],
  }));

  const colors = ["#4ade80", "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6", "#f43f5e", "#fb7185", "#facc15", "#2dd4bf", "#8b5cf6"];

  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);

  const renderLabel = (entry: any) => {
    const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
    return `${entry.name}: ${percent}%`;
  };

  return (
    <div className="bg-black/40 p-6 rounded-xl border border-cyan-500/20 min-h-[340px]" style={{ minWidth: '340px' }}>
      <h2 className="text-cyan-400 mb-3">File Distribution</h2>
      <PieChart width={340} height={300}>
        <Pie data={data} dataKey="value" outerRadius={80} label={renderLabel} labelLine={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value}`, 'Files']} />
      </PieChart>
    </div>
  );
}
