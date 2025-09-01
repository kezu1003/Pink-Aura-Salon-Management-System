import { useEffect, useState } from "react";

const fmt = (ms) => {
  if (ms === null) return "";
  if (ms <= 0) return "Expired";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};

export default function CountdownBadge({ expiresInMs }) {
  const [nowLeft, setNowLeft] = useState(expiresInMs);
  useEffect(() => {
    setNowLeft(expiresInMs);
    if (expiresInMs == null) return;
    const id = setInterval(() => setNowLeft(p => (p == null ? null : p - 1000)), 1000);
    return () => clearInterval(id);
  }, [expiresInMs]);

  if (expiresInMs == null) return null;
  const txt = fmt(nowLeft);
  const style = nowLeft <= 0 ? "bg-red-600" : "bg-amber-500";
  return <span className={`text-xs ${style} text-white px-2 py-0.5 rounded`}>{txt}</span>;
}
