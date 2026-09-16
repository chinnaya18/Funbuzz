import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminLogin, scorerLogin, participantLogin } from '../../services/authService';
import toast from 'react-hot-toast';
import {
  Zap,
  Users,
  BarChart3,
  Lock,
  User,
  Eye,
  EyeOff,
  KeyRound,
  Hash,
  Settings,
  ArrowRight
} from 'lucide-react';

const UnifiedLogin = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'admin';
  const [activeTab, setActiveTab] = useState(
    ['admin', 'scorer', 'participant'].includes(initialTab) ? initialTab : 'admin'
  );

  // Form states - completely empty by default (no demo credentials prefilled)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'admin') {
        if (!username.trim() || !password.trim()) {
          toast.error('Username and password are required');
          setLoading(false);
          return;
        }
        const res = await adminLogin(username.trim(), password.trim());
        login(res.data.user, res.data.token);
        toast.success(`Welcome back, ${res.data.user.username}!`);
        navigate('/admin/dashboard');
      } else if (activeTab === 'scorer') {
        if (!username.trim() || !password.trim()) {
          toast.error('Username and password are required');
          setLoading(false);
          return;
        }
        const res = await scorerLogin(username.trim(), password.trim());
        login(res.data.user, res.data.token);
        toast.success(`Authenticated as Scorer (${res.data.user.username})`);
        navigate('/scorer/dashboard');
      } else if (activeTab === 'participant') {
        if (!rollNumber.trim()) {
          toast.error('Roll Number is required');
          setLoading(false);
          return;
        }
        const res = await participantLogin(name.trim(), rollNumber.trim(), passcode.trim());
        login(res.data.user, res.data.token);
        toast.success(`Welcome, ${res.data.user.name || res.data.user.rollNumber}!`);
        navigate('/participant/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070709] text-white flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* Background Stage Image with Dark Vignette & Red Light Bloom */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center opacity-40 mix-blend-screen transition-opacity duration-700"
        style={{
          backgroundImage: `url('/images/stage-bg.jpg')`,
          filter: 'brightness(0.8) contrast(1.1)'
        }}
      />

      {/* Atmospheric Vignette Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/80" />
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-r from-[#070709] via-[#070709]/40 to-[#070709]" />
      
      {/* Red Ambient Radial Glow Spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E50914]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#E50914]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* 1. TOP NAVBAR */}
      <header className="unified-login-header relative z-30">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914] to-[#80050B] flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.6)]">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center leading-none text-2xl tracking-tight">
              <span className="font-extrabold text-white">Fun</span>
              <span className="font-black text-[#E50914]">Buzz</span>
            </div>
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#8E8E93] uppercase mt-0.5">
              EVENT CONTROL CENTER
            </span>
          </div>
        </div>

        {/* Navigation & Utilities */}
        <div className="flex items-center gap-4">
          </div>
      </header>

      {/* 2. MAIN CONTENT (HERO + LOGIN CARD) */}
      <main className="unified-login-main relative z-20">
        
        {/* LEFT COLUMN: HERO HEADLINE & HIGHLIGHTS */}
        <div className="hero-left-column">
          
          {/* Top Pill */}
          <div className="hero-platform-badge">
            <span className="hero-platform-badge-dot" />
            <span className="hero-platform-badge-text">
              REAL-TIME EVENT PLATFORM
            </span>
          </div>

          {/* Giant Headline */}
          <div className="hero-giant-headline">
            <h1 className="hero-headline-word">
              PLAY
            </h1>
            <h1 className="hero-headline-word hero-headline-red">
              COMPETE
            </h1>
            <h1 className="hero-headline-word">
              CREATE IMPACT
            </h1>
          </div>

          {/* Paragraph copy */}
          <p className="hero-description">
            FunBuzz is a real-time, interactive event platform for college symposiums, hackathons, and quiz events. Manage participants, control events, award scores, and showcase live leaderboards — all in one place.
          </p>

          {/* Feature Highlights */}
          <div className="flex items-center gap-4 pt-4 text-xs text-[#9CA3AF]">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Live WebSocket Sync
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" /> 50 Challenge Questions
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Instant Scoring
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN CARD */}
        <div className="hero-right-column">
          
          <div className="login-card-container">
            
            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A0A0C] border border-[#E50914]/40 text-[#E50914] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
                {activeTab === 'admin' ? 'Admin Authentication' : activeTab === 'scorer' ? 'Evaluator Access' : 'Contestant Check-in'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {activeTab === 'admin' ? (
                  <>Admin <span className="text-[#E50914]">Console</span></>
                ) : activeTab === 'scorer' ? (
                  <>Scorer <span className="text-[#E50914]">Portal</span></>
                ) : (
                  <>Participant <span className="text-[#E50914]">Entry</span></>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1.5 font-medium">
                {activeTab === 'admin' 
                  ? 'Sign in to manage tournament, questions & controls' 
                  : activeTab === 'scorer' 
                  ? 'Sign in to award real-time scores to contestants' 
                  : 'Enter your registered roll number to join'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form-group">
              
              {activeTab === 'participant' ? (
                /* PARTICIPANT FIELDS */
                <>
                  <div className="login-input-wrapper">
                    <Hash className="login-input-icon w-4 h-4" />
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                      placeholder="Roll Number"
                      className="login-input-field"
                    />
                  </div>

                  <div className="login-input-wrapper">
                    <KeyRound className="login-input-icon w-4 h-4" />
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Passcode or Name"
                      className="login-input-field"
                    />
                  </div>
                </>
              ) : (
                /* ADMIN & SCORER FIELDS */
                <>
                  <div className="login-input-wrapper">
                    <User className="login-input-icon w-4 h-4" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="login-input-field"
                    />
                  </div>

                  <div className="login-input-wrapper">
                    <Lock className="login-input-icon w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="login-input-field"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-input-action"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}

              {/* Options Row */}
              <div className="flex items-center justify-between text-xs pt-1 pb-1">
                <label className="flex items-center gap-2 text-[#9CA3AF] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#111116] border-[#2E2E36] text-[#E50914] focus:ring-0 focus:ring-offset-0 accent-[#E50914] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR QUICK SWITCH Divider */}
            <div className="login-divider-container">
              <div className="login-divider-line" />
              <span className="login-divider-badge">
                PORTAL ACCESS
              </span>
            </div>

            {/* Quick Access Grid: Only 3 Roles (No stage) */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'participant',
                  label: 'Participant\nPortal',
                  icon: Users,
                  action: () => setActiveTab('participant')
                },
                {
                  id: 'scorer',
                  label: 'Scorer\nPortal',
                  icon: BarChart3,
                  action: () => setActiveTab('scorer')
                },
                {
                  id: 'admin',
                  label: 'Admin\nConsole',
                  icon: Settings,
                  action: () => setActiveTab('admin')
                }
              ].map((card) => {
                const Icon = card.icon;
                const isCurrent = activeTab === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={card.action}
                    className={`quick-access-tile ${isCurrent ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>
                      {card.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer Tagline */}
            <div className="text-center mt-6 pt-1">
              <span className="text-[11px] font-medium text-[#6B7280]">
                Powering Memorable Events
              </span>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-[#52525B] border-t border-[#18181D]">
        <span>FunBuzz &copy; 2026 &bull; Real-time Event Management</span>
      </footer>

    </div>
  );
};

export default UnifiedLogin;
