import { useState } from "react";
import API from "../api";

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
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Create New Ticket
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Brief summary of the issue"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the issue in detail..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleClassify}
            disabled={classifying || !form.description.trim()}
            className="mt-2 inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {classifying ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                Classifying...
              </>
            ) : (
              "✨ AI Suggest Category & Priority"
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select priority</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition"
        >
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}
