import { LayoutDashboard, FileText, Hash, Clock, Briefcase, FileJson, LogOut } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onChangeTab, isOpen, onToggle, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "evidence", label: "Evidence Upload", icon: FileText },
    { id: "hashes", label: "Hash Analyzer", icon: Hash },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "cases", label: "Cases", icon: Briefcase },
    { id: "reports", label: "Reports", icon: FileJson },
  ];

  return (
    <aside className={`transition-all duration-300 ${isOpen ? 'w-64 p-6' : 'w-16 p-2'} bg-gradient-to-b from-[#0f1128]/90 to-[#0b0f1f]/90 backdrop-blur-xl border-r border-cyan-800/30 flex flex-col shadow-2xl`}>
      <div className="mb-6 flex justify-between items-center">
        {isOpen && <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Forensics</h1>}
        <button
          onClick={onToggle}
          className="w-8 h-8 grid place-items-center bg-cyan-500/70 rounded hover:bg-cyan-400 text-black"
        >
          {isOpen ? '<' : '>'}
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center gap-3 ${isOpen ? 'px-4 py-2' : 'px-2 py-2 justify-center'} rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onLogout}
        className={`w-full flex items-center gap-3 ${isOpen ? 'px-4 py-2' : 'px-2 py-2 justify-center'} rounded-lg transition-colors text-slate-300 hover:text-white hover:bg-red-800/50 mt-auto`}
      >
        <LogOut size={20} />
        {isOpen && <span>Logout</span>}
      </button>
    </aside>
  );
}
