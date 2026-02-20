import { useEffect, useState } from "react";
import API from "../api";
import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  InboxIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-200 h-24 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const formatLabel = (s) =>
    s ? s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  return (
    <div className="space-y-8">
      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Tickets"
          value={stats.total_tickets}
          icon={<InboxIcon className="w-6 h-6 text-indigo-600" />}
          bg="bg-indigo-50"
          border="border-indigo-100"
        />
        <StatCard
          label="Open Tickets"
          value={stats.open_tickets}
          icon={<ExclamationCircleIcon className="w-6 h-6 text-amber-600" />}
          bg="bg-amber-50"
          border="border-amber-100"
        />
        <StatCard
          label="Resolved"
          value={
            stats.priority_breakdown
              ? stats.total_tickets - stats.open_tickets
              : 0
          }
          icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
          bg="bg-emerald-50"
          border="border-emerald-100"
        />
        <StatCard
          label="Ticket Categories"
          value={stats.category_breakdown?.length || 0}
          icon={<TagIcon className="w-6 h-6 text-purple-600" />}
          bg="bg-purple-50"
          border="border-purple-100"
        />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="card bg-white p-6 border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <ChartBarIcon className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Priority Distribution
            </h3>
          </div>
          <div className="space-y-4">
            {stats.priority_breakdown?.map((item) => (
              <BreakdownBar
                key={item.priority}
                label={formatLabel(item.priority)}
                count={item.count}
                total={stats.total_tickets}
                color={priorityColorClass(item.priority)}
              />
            ))}
            {(!stats.priority_breakdown ||
              stats.priority_breakdown.length === 0) && (
              <EmptyState message="No priority data available" />
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card bg-white p-6 border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <TagIcon className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Category Distribution
            </h3>
          </div>
          <div className="space-y-4">
            {stats.category_breakdown?.map((item) => (
              <BreakdownBar
                key={item.category}
                label={formatLabel(item.category)}
                count={item.count}
                total={stats.total_tickets}
                color="bg-indigo-500"
              />
            ))}
            {(!stats.category_breakdown ||
              stats.category_breakdown.length === 0) && (
              <EmptyState message="No category data available" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bg, border }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-6 border ${border} ${bg} transition-all duration-300 hover:scale-[1.02] hover:shadow-sm group`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {label}
          </p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

function BreakdownBar({ label, count, total, color }) {
  const percentage = Math.round((count / total) * 100) || 0;
  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
          {label}
        </span>
        <span className="text-slate-500 font-medium">
          {count} <span className="text-slate-300 text-xs">/ {total}</span>
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
      <InboxIcon className="w-8 h-8 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

const priorityColorClass = (p) => {
  switch (p) {
    case "critical":
      return "bg-rose-500"; // Red
    case "high":
      return "bg-orange-500"; // Orange
    case "medium":
      return "bg-amber-400"; // Yellow
    case "low":
    default:
      return "bg-emerald-500"; // Green
  }
};
