import { useState } from "react";
import API from "../api";
import { SparklesIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

const CATEGORIES = ["billing", "technical", "account", "general"];
const PRIORITIES = ["low", "medium", "high", "critical"];

export default function TicketForm({ onTicketCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
  });
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClassify = async () => {
    if (!form.description.trim()) return;
    setClassifying(true);
    try {
      const res = await API.post("/tickets/classify/", {
        description: form.description,
      });
      const { suggested_category, suggested_priority } = res.data;
      setForm((prev) => ({
        ...prev,
        category: suggested_category || prev.category,
        priority: suggested_priority || prev.priority,
      }));
    } catch (err) {
      console.error("Classification failed:", err);
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.priority)
      return;
    setLoading(true);
    try {
      await API.post("/tickets/", form);
      setForm({ title: "", description: "", category: "", priority: "" });
      if (onTicketCreated) onTicketCreated();
    } catch (err) {
      console.error("Failed to create ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-full">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800">Create New Ticket</h2>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the details below to submit a support request.
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ticket Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Brief summary of the issue"
              className="input-field"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                Description
              </label>
              <button
                type="button"
                onClick={handleClassify}
                disabled={classifying || !form.description.trim()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {classifying ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <>
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Auto-fill with AI
                  </>
                )}
              </button>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the issue in detail..."
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input-field appearance-none"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Priority
              </label>
              <div className="relative">
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="input-field appearance-none"
                >
                  <option value="">Select priority</option>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Creating Ticket...
              </span>
            ) : (
              <>
                Create Ticket
                <PaperAirplaneIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
