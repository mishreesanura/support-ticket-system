import { XMarkIcon } from "@heroicons/react/24/outline";

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

const formatLabel = (s) =>
  s ? s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

export default function TicketDetail({ ticket, onClose }) {
  if (!ticket) return null;

  const status = statusConfig[ticket.status] || statusConfig.open;
  const priority = priorityConfig[ticket.priority] || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex-1 pr-4">
            <p className="text-xs text-slate-400 font-medium mb-1">
              Ticket #{ticket.id}
            </p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}
            >
              {status.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {formatLabel(ticket.priority)}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {formatLabel(ticket.category)}
            </span>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Meta */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Created on{" "}
              <span className="font-medium text-slate-600">
                {new Date(ticket.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
