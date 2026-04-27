import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Activity, LayoutDashboard, History, Share2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
}

export default function Layout({ children, user }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Historical Reports', icon: <History size={18} />, path: '/history' },
  ];

  if (!user && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') {
      return <>{children}</>;
  }

  // Pure Landing or Auth pages get simple layout
  if (!user) {
      return (
          <div className="min-h-screen bg-[#f8fafc]">
              <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-50">
                  <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-blue-600">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px]">P</div>
                    Pulse AI
                  </Link>
                  <div className="flex gap-4">
                      <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600">Sign In</Link>
                      <Link to="/register" className="text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded-lg">Join Network</Link>
                  </div>
              </nav>
              {children}
          </div>
      );
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans text-[#0f172a]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col p-6 fixed h-full z-50">
        <div className="flex items-center gap-2 font-extrabold text-xl text-[#2563eb] mb-12">
            <div className="w-6 h-6 bg-[#2563eb] rounded flex items-center justify-center text-white text-[10px]">P</div>
            Pulse AI
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    location.pathname === item.path 
                      ? "bg-blue-50 text-blue-600 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* User Info & Auto-Run in Sidebar */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="text-[13px] font-bold text-slate-900">{user.school_name}</div>
              <div className="text-[11px] text-slate-500 font-medium">Principal: {user.principal_name}</div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                <Activity size={10} className="text-blue-500" />
                NEXT AUTO-RUN
              </div>
              <div className="text-[12px] font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block w-fit">
                07:02 PM
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
          {children}
          <footer className="bg-white border-t border-[#e2e8f0] py-4 px-8 text-center text-slate-400 text-[10px] font-mono tracking-widest uppercase">
            &copy; {new Date().getFullYear()} MORNING PULSE ENGINE / INTEL-SYS
          </footer>
      </div>
    </div>
  );
}
