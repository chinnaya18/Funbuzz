import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { getParticipantScore } from '../../services/scoreService';
import { getEventStatus } from '../../services/eventService';
import { EVENT_STATUSES } from '../../utils/constants';
import LeaderboardTable from '../../components/LeaderboardTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Clock, Trophy, Flame } from 'lucide-react';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { leaderboard, loading: lbLoading } = useLeaderboard();
  const [score, setScore] = useState(0);
  const [myRank, setMyRank] = useState('-');
  const [eventStatus, setEventStatus] = useState('waiting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!user?.id || leaderboard.length === 0) return;
    const myEntry = leaderboard.find(e => e.participantId === user.id);
    if (myEntry) {
      setScore(myEntry.totalScore);
      setMyRank(myEntry.rank);
    }
  }, [leaderboard, user?.id]);

  useEffect(() => {
    if (!socket) return;
    socket.on('event:statusChanged', (data) => {
      setEventStatus(data.status);
    });
    return () => { socket.off('event:statusChanged'); };
  }, [socket]);

  const fetchInitialData = async () => {
    try {
      const [scoreRes, eventRes] = await Promise.all([
        getParticipantScore(user.id),
        getEventStatus()
      ]);
      setScore(scoreRes.data.totalScore || 0);
      setEventStatus(eventRes.data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Connecting to event server..." />;

  const statusConfig = EVENT_STATUSES[eventStatus] || EVENT_STATUSES.waiting;

  // Waiting state
  if (eventStatus === 'waiting') {
    return (
      <div className="backdrop-blur-2xl bg-[#0B0B10]/95 border border-[#232334] rounded-3xl p-8 sm:p-10 text-center shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center gap-5 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#80050B] flex items-center justify-center text-white shadow-[0_0_25px_rgba(229,9,20,0.5)]">
          <Clock size={32} />
        </div>
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#E50914] uppercase">
            CONTESTANT LOBBY
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            Waiting for Round to Begin
          </h2>
          <p className="text-sm text-[#A1A1AA] max-w-md mx-auto mt-2 leading-relaxed">
            Welcome, <span className="text-white font-bold">{user.name}</span> ({user.rollNumber}). The event coordinators will activate live scoring shortly.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161622] border border-[#2B2B3E] text-xs font-mono text-[#D1D5DB]">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse shadow-[0_0_8px_#E50914]" />
          Status: Ready on Stage Feed
        </div>
      </div>
    );
  }

  return (
    <div
      className="backdrop-blur-2xl bg-[#0B0B10]/95 border border-[#232334] rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.85)] animate-fade-in w-full"
      style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      
      {/* 1. Participant Identity Header Card */}
      <div
        className="rounded-2xl bg-[#101016] border border-[#20202E] flex flex-wrap items-center justify-between"
        style={{ padding: '22px 26px', gap: '16px' }}
      >
        <div className="flex items-center" style={{ gap: '16px' }}>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#80050B] flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(229,9,20,0.4)]">
            {user.name?.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E50914] font-bold block">
              OFFICIAL CONTESTANT
            </span>
            <h2 className="text-2xl font-black text-white leading-tight" style={{ marginTop: '4px' }}>
              {user.name}
            </h2>
            <span className="text-xs font-mono text-[#A1A1AA] font-semibold block" style={{ marginTop: '4px' }}>
              Roll No: <span className="text-[#FF3B47]">{user.rollNumber}</span>
            </span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${statusConfig.bg} ${statusConfig.color} border border-current/20 shadow-md`}>
          {eventStatus === 'running' && <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />}
          {eventStatus === 'running' && <span className="w-2 h-2 rounded-full bg-[#10B981]" />}
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* 2. Dual Big Metric Cards: Score & Rank */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '20px' }}>
        {/* Total Score */}
        <div
          className="rounded-2xl bg-[#101018] border border-[#222232] hover:border-[#E50914]/50 transition-all flex flex-col items-center justify-center text-center shadow-lg"
          style={{ padding: '28px 24px' }}
        >
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#A1A1AA]" style={{ marginBottom: '10px' }}>
            <Flame size={16} className="text-[#E50914] fill-current" />
            <span>Your Cumulative Score</span>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight" style={{ margin: '6px 0' }}>
            {score}
          </p>
          <span className="text-xs font-mono text-[#E50914] font-bold uppercase tracking-widest" style={{ marginTop: '6px' }}>
            POINTS EARNED
          </span>
        </div>

        {/* Current Rank */}
        <div
          className="rounded-2xl bg-[#101018] border border-[#222232] hover:border-amber-500/50 transition-all flex flex-col items-center justify-center text-center shadow-lg"
          style={{ padding: '28px 24px' }}
        >
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#A1A1AA]" style={{ marginBottom: '10px' }}>
            <Trophy size={16} className="text-amber-400" />
            <span>Current Standing</span>
          </div>
          <p className="text-4xl sm:text-5xl font-black text-[#E50914] font-mono tracking-tight" style={{ margin: '6px 0' }}>
            #{myRank}
          </p>
          <span className="text-xs font-mono text-[#A1A1AA] font-bold uppercase tracking-widest" style={{ marginTop: '6px' }}>
            LEADERBOARD RANK
          </span>
        </div>
      </div>

      {/* 3. Live Arena Leaderboard Container */}
      <div
        className="rounded-2xl bg-[#0E0E14] border border-[#20202E] shadow-xl"
        style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}
      >
        <div className="flex items-center justify-between" style={{ paddingBottom: '14px', borderBottom: '1px solid #1E1E2A' }}>
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
            Live Arena Leaderboard
          </h3>
          <span className="text-[11px] font-mono text-[#71717A]">
            {leaderboard.length} Contestants Active
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto pr-1">
          {lbLoading ? (
            <div style={{ padding: '32px 0' }}>
              <LoadingSpinner size="sm" text="Updating real-time standings..." />
            </div>
          ) : (
            <LeaderboardTable leaderboard={leaderboard} compact={true} />
          )}
        </div>
      </div>

      {/* Concluded Notification */}
      {eventStatus === 'ended' && (
        <div
          className="rounded-2xl bg-gradient-to-r from-[#1A0A0C] to-[#12121A] border border-[#E50914]/50 text-center shadow-lg"
          style={{ padding: '22px 24px' }}
        >
          <p className="text-sm font-black text-[#E50914] uppercase tracking-wider">
            🏆 Tournament Completed
          </p>
          <p className="text-xs text-[#A1A1AA]" style={{ marginTop: '6px' }}>
            Final standings and podium have been locked by the event coordinators.
          </p>
        </div>
      )}
    </div>
  );
};

export default ParticipantDashboard;
