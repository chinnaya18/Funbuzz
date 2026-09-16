import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  LayoutDashboard,
  FileText,
  Users,
  Trophy,
  BarChart3,
  Tv,
  Sliders,
  Settings,
  Maximize2,
  Crown,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/?tab=admin');
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/questions', label: 'Questions', icon: FileText },
    { to: '/admin/participants', label: 'Participants', icon: Users },
    { to: '/admin/scores', label: 'Scores', icon: Trophy },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { to: '/stage', label: 'Projection', icon: Tv, external: true },
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col select-none overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 h-16 bg-[#0B0B0F]/95 backdrop-blur-md border-b border-[#1E1E26] px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Brand + Live Badge */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#14141A] border border-[#252530] text-[#A1A1AA] hover:text-white"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#80050B] flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.6)]">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center leading-none text-lg tracking-tight font-black">
                <span className="text-white">Fun</span>
                <span className="text-[#E50914]">Buzz</span>
              </div>
              <span className="text-[9px] tracking-[0.2em] font-bold text-[#8E8E93] uppercase mt-0.5">
                EVENT CONTROL CENTER
              </span>
            </div>
          </Link>

          {/* Live Competition Badge */}
          <div className="hidden sm:flex items-center pl-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A0A0C] border border-[#E50914]/50 shadow-[0_0_12px_rgba(229,9,20,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse shadow-[0_0_8px_#E50914]" />
              <span className="text-[10px] font-black text-[#FF3B47] uppercase tracking-wider">
                LIVE
              </span>
              <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                COMPETITION
              </span>
            </div>
          </div>
        </div>

        {/* Right: Projection, Settings, Admin Profile, Logout */}
        <div className="flex items-center gap-3">
          {/* Projection Shortcut - Red Theme Button */}
          <button
            onClick={() => navigate('/stage')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E50914] to-[#C20710] hover:from-[#FF1E27] hover:to-[#E50914] text-white text-xs font-bold transition-all shadow-[0_0_16px_rgba(229,9,20,0.45)] hover:shadow-[0_0_24px_rgba(229,9,20,0.7)] cursor-pointer"
            title="Open Big Screen Projection"
          >
            <Maximize2 size={13} className="text-white stroke-[2.5]" />
            <span>Projection</span>
          </button>

          {/* Settings Icon */}
          <button
            onClick={() => navigate('/admin/settings')}
            className="w-9 h-9 rounded-xl bg-[#13131A] border border-[#242430] hover:border-[#E50914]/50 hover:bg-[#1A1A24] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
            title="Settings"
          >
            <Settings size={15} />
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#13131A] border border-[#272736]">
            <Crown size={14} className="text-[#E50914]" />
            <span className="text-xs font-bold text-white font-mono">{user?.username || 'admin'}</span>
            <span className="px-1.5 py-0.5 rounded bg-[#E50914]/15 border border-[#E50914]/30 text-[9px] font-black text-[#E50914] tracking-wider uppercase">
              ADMIN
            </span>
          </div>

          {/* Logout Button - Red Theme */}
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-[#E50914]/15 hover:bg-[#E50914] border border-[#E50914]/40 hover:border-[#E50914] text-[#E50914] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT                                     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex w-full">
        
        {/* Left Sidebar */}
        <aside
          className={`w-64 bg-[#0A0A0E] border-r border-[#1C1C24] flex flex-col justify-between pt-5 pb-6 px-3.5 flex-shrink-0 min-h-[calc(100vh-4rem)] z-30 transition-all ${
            sidebarOpen ? 'fixed inset-y-0 left-0 pt-20 shadow-2xl flex' : 'hidden md:flex'
          }`}
        >
          {/* Nav List */}
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((item, idx) => {
              const Icon = item.icon;
              const isActive = !item.external && location.pathname === item.to && idx === 0; // dashboard active or exact

              if (item.external) {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate(item.to);
                    }}
                    className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#8E8E93] hover:text-white hover:bg-[#14141C] transition-all text-left cursor-pointer"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={idx}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive: linkActive }) =>
                    `w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      linkActive && item.to === location.pathname
                        ? 'bg-gradient-to-r from-[#E50914] to-[#B20710] text-white border border-[#FF3344] shadow-[0_0_18px_rgba(229,9,20,0.45)]'
                        : 'text-[#8E8E93] hover:text-white hover:bg-[#14141C]'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto pt-6 px-2">
            <div className="text-[10px] font-mono text-[#555566] text-center">
              FunBuzz v1.0
            </div>
          </div>
        </aside>

        {/* Main Content Area with generous 4-side spacing */}
        <main
          className="flex-1 min-w-0 bg-[#08080C] overflow-y-auto"
          style={{ padding: '32px 36px 48px 36px' }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
