import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptIndianRupee, Bot, Bell, LogOut, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ReceiptIndianRupee },
  { name: 'AI CFO (MAYA)', path: '/ai-cfo', icon: Bot },
  { name: 'Invoices', path: '/invoices', icon: FileText },
  { name: 'Forecast', path: '/forecast', icon: TrendingUp },
  { name: 'Data Intelligence', path: '/intelligence', icon: BarChart3 },
  { name: 'Alerts', path: '/alerts', icon: Bell },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside className="w-72 bg-[#020617] border-r border-white/5 flex flex-col relative z-20">
      <div className="p-8">
        <NavLink to="/" className="flex items-center gap-3 font-bold text-2xl tracking-tight group">
          <img src="/maya-genie.png" alt="Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">VyapaarMind</span>
        </NavLink>
      </div>

      <nav className="flex-1 px-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 font-bold"
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110")} />
            <span className="tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3.5 w-full text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-xs">Logout</span>
        </button>
      </div>
    </aside>
  );
}

