import { useState, useEffect, useMemo } from "react";
import API from "../services/api";
import { Trash2, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import LeadModal from "./LeadModal";

export default function LeadList() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((lead) => lead.status === "new").length;
    const contactedCount = leads.filter(
      (lead) => lead.status === "contacted",
    ).length;
    const convertedCount = leads.filter(
      (lead) => lead.status === "converted",
    ).length;

    return { total, newCount, contactedCount, convertedCount };
  }, [leads]);

  const fetchLeads = async (
    pageNum,
    searchQuery = search,
    statusQuery = statusFilter,
  ) => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(
        `/leads?page=${pageNum}&limit=5&search=${searchQuery}&status=${statusQuery}`,
      );
      setLeads(res.data.leads || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || pageNum);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchLeads(page, search, statusFilter);
    }, 0);

    return () => clearTimeout(timeout);
    // fetchLeads is intentionally recreated with the current filter values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads(1, search, statusFilter);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/leads/${id}/status`, { status });
      fetchLeads(page, search, statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await API.delete(`/leads/${id}`);
      fetchLeads(page, search, statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lead");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
          <div className="text-xs uppercase tracking-wider text-cyan-200">
            Total Leads
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
          <div className="text-xs uppercase tracking-wider text-sky-200">
            New
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.newCount}</div>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
          <div className="text-xs uppercase tracking-wider text-violet-200">
            Contacted
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.contactedCount}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="text-xs uppercase tracking-wider text-emerald-200">
            Converted
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.convertedCount}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <h3 className="text-lg font-medium">Leads Directory</h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
          >
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-lg pl-3 pr-9 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 w-full sm:w-64"
            />
            <button
              type="submit"
              className="absolute right-2.5 text-slate-400 hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="" className="bg-slate-900">
              All Statuses
            </option>
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition text-sm shadow-lg shadow-cyan-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {error && (
        <p className="bg-red-500/20 border border-red-500/40 text-red-200 p-3 rounded-lg text-sm">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20 backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-300 text-xs uppercase tracking-wider">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Status</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Created At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-400">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-400">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-white/5 transition">
                  <td className="p-4 font-medium">{lead.name}</td>
                  <td className="p-4 text-slate-300">{lead.email}</td>
                  <td className="p-4 text-slate-300">{lead.phone}</td>
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleStatusChange(lead._id, e.target.value)
                      }
                      className="bg-slate-900/80 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                    </select>
                  </td>
                  <td className="p-4 text-slate-300">{lead.assignedTo}</td>
                  <td className="p-4 text-slate-300 whitespace-nowrap">
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(lead._id)}
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-2 gap-3">
        <span className="text-sm text-slate-400">
          Page {page} of {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 px-3 py-1.5 rounded-lg text-sm border border-white/10 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 px-3 py-1.5 rounded-lg text-sm border border-white/10 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <LeadModal
        key={isModalOpen ? "lead-modal-open" : "lead-modal-closed"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadCreated={() => fetchLeads(page, search, statusFilter)}
      />
    </div>
  );
}
