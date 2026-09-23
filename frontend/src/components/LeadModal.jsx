import { useState } from "react";
import API from "../services/api";
import { X } from "lucide-react";

export default function LeadModal({ isOpen, onClose, onLeadCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "new",
    assignedTo: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => onClose();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await API.post("/leads", {
        ...formData,
        status: formData.status.toLowerCase(),
        assignedTo: formData.assignedTo.trim(),
      });
      onLeadCreated();
      setFormData({
        name: "",
        email: "",
        phone: "",
        status: "new",
        assignedTo: "",
      });
      handleClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create lead",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${isOpen ? "animate-fade-in" : "animate-fade-out pointer-events-none"}`}
    >
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 w-full max-w-md text-white shadow-2xl relative backdrop-blur-xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New Lead</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <p className="bg-red-500/20 border border-red-500/40 text-red-200 p-3 rounded-lg mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="new" className="bg-slate-900">
                New
              </option>
              <option value="contacted" className="bg-slate-900">
                Contacted
              </option>
              <option value="converted" className="bg-slate-900">
                Converted
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1">
              Assigned To
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="Employee name"
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold p-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Lead"}
          </button>
        </form>
      </div>
    </div>
  );
}
