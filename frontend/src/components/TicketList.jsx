import { useEffect, useState } from "react";
import API from "../api";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const priorityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function TicketList({ refreshKey }) {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });
  const [search, setSearch] = useState("");

  const fetchTickets = async () => {
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
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshKey, filters]);

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
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tickets</h2>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {formatLabel(s)}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Priorities</option>
          {["low", "medium", "high", "critical"].map((p) => (
            <option key={p} value={p}>
              {formatLabel(p)}
            </option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {["billing", "technical", "account", "general"].map((c) => (
            <option key={c} value={c}>
              {formatLabel(c)}
            </option>
          ))}
        </select>

        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {tickets.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          No tickets found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {ticket.title}
                    </div>
                    <div className="text-gray-400 text-xs truncate max-w-xs">
                      {ticket.description}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      {formatLabel(ticket.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority] || ""}`}
                    >
                      {formatLabel(ticket.priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(ticket.id, e.target.value)
                      }
                      className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${statusColors[ticket.status] || ""}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {formatLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
