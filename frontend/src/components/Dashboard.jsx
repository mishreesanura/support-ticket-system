import { useEffect, useState } from "react";
import API from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/tickets/stats/");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">Loading dashboard...</div>
    );
  }

  const formatLabel = (s) =>
    s ? s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Tickets"
          value={stats.total_tickets}
          color="bg-indigo-500"
        />
        <StatCard
          label="Open Tickets"
          value={stats.open_tickets}
          color="bg-blue-500"
        />
        <StatCard
          label="Resolved"
          value={
            stats.priority_breakdown
              ? stats.total_tickets - stats.open_tickets
              : 0
          }
          color="bg-green-500"
        />
        <StatCard
          label="Categories"
          value={stats.category_breakdown?.length || 0}
          color="bg-amber-500"
        />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">
            Priority Breakdown
          </h3>
          <div className="space-y-2">
            {stats.priority_breakdown?.map((item) => (
              <BreakdownBar
                key={item.priority}
                label={formatLabel(item.priority)}
                count={item.count}
                total={stats.total_tickets}
                color={priorityBarColor(item.priority)}
              />
            ))}
            {stats.priority_breakdown?.length === 0 && (
              <p className="text-gray-400 text-sm">No data yet.</p>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">
            Category Breakdown
          </h3>
          <div className="space-y-2">
            {stats.category_breakdown?.map((item) => (
              <BreakdownBar
                key={item.category}
                label={formatLabel(item.category)}
                count={item.count}
                total={stats.total_tickets}
                color="bg-indigo-500"
              />
            ))}
            {stats.category_breakdown?.length === 0 && (
              <p className="text-gray-400 text-sm">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-center justify-center">
      <div
        className={`text-3xl font-bold text-white ${color} w-14 h-14 rounded-full flex items-center justify-center mb-2`}
      >
        {value}
      </div>
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
  );
}

function BreakdownBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-500">
          {count} ({pct}%)
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function priorityBarColor(priority) {
  const map = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };
  return map[priority] || "bg-gray-400";
}
