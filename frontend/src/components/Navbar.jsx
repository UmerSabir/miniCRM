import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900/40 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center text-white">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-6 h-6 text-cyan-400" />
        <span className="font-bold text-lg">Mini CRM</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">{user?.name || "User"}</span>
        <button
          onClick={logout}
          className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg border border-red-500/30 transition text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
}
