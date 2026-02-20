import { useCallback, useEffect, useRef, useState } from "react";
import API from "../api";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import TicketDetail from "./TicketDetail";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];

const statusConfig = {
  open: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    label: "Open",
  },
  in_progress: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    label: "In Progress",
  },
  resolved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    label: "Resolved",
  },
  closed: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    label: "Closed",
  },
};

const priorityConfig = {
  low: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  high: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  critical: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export default function TicketList({ refreshKey }) {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const isMounted = useRef(false);

  const fetchTickets = useCallback(async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (search.trim()) params.search = search.trim();

      const res = await API.get("/tickets/", { params });
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  }, [filters, search]);

  useEffect(() => {
    isMounted.current = true;
    const load = async () => {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (search.trim()) params.search = search.trim();

      try {
        const res = await API.get("/tickets/", { params });
        if (isMounted.current) setTickets(res.data);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    };
    load();
    return () => {
      isMounted.current = false;
    };
  }, [refreshKey, filters, search]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/tickets/${id}/`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const formatLabel = (s) =>
    s ? s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  return (
    <div className="card">
      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
        <h2 className="font-semibold text-slate-800">All Tickets</h2>

        {/* Filters & Search - Improved UI */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <form
            onSubmit={handleSearch}
            className="relative group flex-grow md:flex-grow-0"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="pl-9 input-field py-2 text-xs w-full md:w-48"
            />
          </form>

          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="pl-3 pr-8 input-field py-2 text-xs appearance-none cursor-pointer hover:bg-slate-50"
            >
              <option value="">Status: All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {formatLabel(s)}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() =>
              setFilters({ status: "", priority: "", category: "" })
            }
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Clear Filters"
          >
            <FunnelIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 w-1/3">Issue</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative inline-block text-left">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusChange(ticket.id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-medium border ${statusConfig[ticket.status]?.bg} ${statusConfig[ticket.status]?.border} ${statusConfig[ticket.status]?.text} focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {statusConfig[s].label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon
                        className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${statusConfig[ticket.status]?.text} opacity-50`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {ticket.title}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xs text-ellipsis">
                        {ticket.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {formatLabel(ticket.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig[ticket.priority]?.bg || "bg-slate-100"} ${priorityConfig[ticket.priority]?.text || "text-slate-600"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${priorityConfig[ticket.priority]?.dot || "bg-slate-400"}`}
                      />
                      {formatLabel(ticket.priority)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-medium">
                    {new Date(ticket.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-slate-400 bg-slate-50/30"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="mb-2 text-2xl">🔍</span>
                    <p className="text-sm">
                      No tickets found matching your filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
