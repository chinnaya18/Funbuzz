import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectionStatus from '../components/ConnectionStatus';
import { LogOut, Zap } from 'lucide-react';

const ParticipantLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen w-full text-white flex flex-col justify-between relative overflow-x-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(10, 10, 15, 0.82) 0%, rgba(5, 5, 8, 0.96) 100%), url('/images/stage-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Red Ambient Glow Spots */}
      <div className="absolute -top-24 left-1/4 w-[40rem] h-[20rem] bg-[#E50914]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[35rem] h-[20rem] bg-[#E50914]/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Header - Aligned with the center container width */}
      <header className="relative z-30 w-full bg-[#0B0B0F]/85 backdrop-blur-md border-b border-[#1E1E28] px-4 sm:px-8" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914] to-[#80050B] flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.5)]">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-wider uppercase leading-none">
                  Fun<span className="text-[#E50914]">Buzz</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 text-[#E50914] text-[10px] font-black uppercase tracking-wider">
                  CONTESTANT ARENA
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#8E8E93] mt-1 leading-none">
                Real-time Participant Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ConnectionStatus />
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-[#E50914]/15 hover:bg-[#E50914] border border-[#E50914]/40 hover:border-[#E50914] text-[#E50914] hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              title="Logout"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Center Screen Content */}
      <main className="relative z-20 flex-1 w-full flex items-center justify-center my-auto" style={{ padding: '24px 16px' }}>
        <div className="w-full max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full py-4 text-center text-[11px] text-[#71717A] border-t border-[#1C1C26] bg-[#07070A]/85 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto w-full px-4 flex items-center justify-between text-[#8E8E93]">
          <span>FunBuzz Live Event Engine</span>
          <span className="font-mono text-[10px]">Real-time WebSocket Synchronized</span>
        </div>
      </footer>
    </div>
  );
};

export default ParticipantLayout;
