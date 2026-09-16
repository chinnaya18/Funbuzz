import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectionStatus from '../components/ConnectionStatus';
import { Award, LogOut, Shield, Zap } from 'lucide-react';

const ScorerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#111111]/95 backdrop-blur-xl border-b border-[#292929] shadow-xl" style={{ padding: '14px 16px' }}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914] to-[#80050B] flex items-center justify-center text-white shadow-lg shadow-[#E50914]/20">
              <Zap size={18} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-wider uppercase">
                  Fun<span className="text-[#E50914]">Buzz</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-[10px] font-bold uppercase tracking-wider">
                  Scorer
                </span>
              </div>
            </div>
          </div>

          {/* Right: Nav + Profile + Logout */}
          <div className="flex items-center" style={{ gap: '12px' }}>
            <nav className="hidden md:flex items-center" style={{ gap: '8px' }}>
              <NavLink
                to="/scorer/dashboard"
                end
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/20'
                      : 'text-[#A1A1A1] hover:text-white hover:bg-[#161616]'
                  }`
                }
              >
                <Award size={15} />
                Scoring
              </NavLink>

              <Link
                to="/admin/dashboard"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A1A1A1] hover:text-white hover:bg-[#161616] border border-transparent hover:border-[#292929] transition-all flex items-center gap-1.5"
              >
                <Shield size={14} />
                Admin
              </Link>
            </nav>

            <ConnectionStatus />
            
            {/* User Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161616] border border-[#292929]">
              <div className="w-7 h-7 rounded-lg bg-[#E50914]/20 text-[#E50914] font-bold text-xs flex items-center justify-center">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-white">{user?.username}</span>
            </div>

            {/* Logout - Red Button */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-[#E50914]/15 hover:bg-[#E50914] border border-[#E50914]/40 hover:border-[#E50914] text-[#E50914] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Logout"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area — Centered */}
      <main className="flex-1 w-full" style={{ padding: '24px 16px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ScorerLayout;
