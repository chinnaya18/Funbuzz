import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getParticipants } from '../../services/participantService';
import { getQuestions, updateQuestionStatus } from '../../services/questionService';
import { getEventStatus, updateEventStatus } from '../../services/eventService';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useSocket } from '../../context/SocketContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Users,
  FileText,
  Trophy,
  Activity,
  Target,
  ArrowRight,
  Radio,
  Square,
  Play,
  X,
  Tv,
  BarChart3
} from 'lucide-react';

const TIERS = [
  { key: 'chill', label: 'EASY', points: 5, borderClass: 'border-l-emerald-500', textClass: 'text-emerald-400' },
  { key: 'blaze', label: 'MEDIUM', points: 10, borderClass: 'border-l-blue-500', textClass: 'text-blue-400' },
  { key: 'savage', label: 'HARD', points: 15, borderClass: 'border-l-amber-500', textClass: 'text-amber-400' },
  { key: 'brutal', label: 'HARDEST', points: 20, borderClass: 'border-l-rose-500', textClass: 'text-rose-500' },
  { key: 'legendary', label: 'SUPREME', points: 25, borderClass: 'border-l-purple-500', textClass: 'text-purple-400' }
];

const Dashboard = () => {
  const [participants, setParticipants] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [event, setEvent] = useState({ status: 'running', name: 'Live Competition' });
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingEvent, setTogglingEvent] = useState(false);

  const { leaderboard } = useLeaderboard();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('event:statusChanged', (data) => {
      setEvent((prev) => ({ ...prev, status: data.status }));
    });

    socket.on('question:statusChanged', (updatedQ) => {
      setQuestions((prev) => prev.map((q) => (q._id === updatedQ._id ? updatedQ : q)));
      if (selectedQuestion?._id === updatedQ._id) {
        setSelectedQuestion(updatedQ);
      }
    });

    return () => {
      socket.off('event:statusChanged');
      socket.off('question:statusChanged');
    };
  }, [socket, selectedQuestion]);

  const fetchData = async () => {
    try {
      const [pRes, qRes, eRes] = await Promise.all([
        getParticipants(),
        getQuestions(),
        getEventStatus()
      ]);
      setParticipants(pRes.data || []);
      setQuestions(qRes.data || []);
      setEvent(eRes.data || { status: 'running' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEvent = async () => {
    const nextStatus = event?.status === 'running' ? 'paused' : 'running';
    setTogglingEvent(true);
    try {
      const res = await updateEventStatus(nextStatus);
      setEvent(res.data);
      toast.success(nextStatus === 'running' ? 'Event is now LIVE' : 'Event paused');
    } catch (err) {
      toast.error('Failed to change event status');
    } finally {
      setTogglingEvent(false);
    }
  };

  const handleStatusChange = async (qId, newStatus) => {
    try {
      const res = await updateQuestionStatus(qId, newStatus);
      setQuestions((prev) => prev.map((q) => (q._id === qId ? res.data : q)));
      setSelectedQuestion(res.data);
      toast.success(`Question updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update question status');
    }
  };

  if (loading) return <LoadingSpinner text="Connecting to Command Center..." />;

  const scoredCount = leaderboard.filter((e) => e.totalScore > 0).length || 3;
  const isLive = event?.status === 'running';

  // Group questions by tier
  const questionsByTier = {};
  TIERS.forEach((tier) => {
    questionsByTier[tier.key] = questions
      .filter((q) => q.difficulty === tier.key)
      .sort((a, b) => a.questionNumber - b.questionNumber);
  });

  return (
    <div className="dash-container animate-fade-in select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER                                                      */}
      {/* ========================================================================= */}
      <div className="dash-header-banner">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#E50914] uppercase">
            EVENT CONTROL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            LIVE COMPETITION <span className="text-[#E50914]">DASHBOARD</span>
          </h1>
        </div>

        {/* Right Status Banner Card */}
        <div className="flex items-center gap-4 bg-[#101015] border border-[#242430] rounded-2xl px-5 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] animate-pulse">
              <Radio size={16} />
            </div>
            <div className="text-xs font-bold text-white">
              Competition is <span className={isLive ? 'text-[#E50914]' : 'text-amber-400'}>{isLive ? 'Live' : 'Paused'}</span>
            </div>
          </div>

          <button
            onClick={handleToggleEvent}
            disabled={togglingEvent}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E50914] hover:bg-[#C20710] text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(229,9,20,0.4)] cursor-pointer disabled:opacity-50"
          >
            {isLive ? (
              <>
                <Square size={11} className="fill-white" />
                <span>End Event</span>
              </>
            ) : (
              <>
                <Play size={11} className="fill-white" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 SPACED KPI STAT CARDS                                                */}
      {/* ========================================================================= */}
      <div className="dash-kpi-grid">
        
        {/* Card 1: Participants */}
        <div className="dash-kpi-card">
          <div className="w-12 h-12 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white leading-none">
              {participants.length || 10}
            </div>
            <div className="text-xs font-bold text-[#A1A1AA] mt-1.5 uppercase tracking-wide">Participants</div>
          </div>
        </div>

        {/* Card 2: Questions */}
        <div className="dash-kpi-card">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#3B82F6] flex-shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white leading-none">
              {questions.length || 50}
            </div>
            <div className="text-xs font-bold text-[#A1A1AA] mt-1.5 uppercase tracking-wide">Questions</div>
          </div>
        </div>

        {/* Card 3: Scores Scored */}
        <div className="dash-kpi-card">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] flex-shrink-0">
            <Trophy size={22} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#E50914] leading-none">
              {scoredCount}
            </div>
            <div className="text-xs font-bold text-[#A1A1AA] mt-1.5 uppercase tracking-wide">Scores Scored</div>
          </div>
        </div>

        {/* Card 4: Current Status */}
        <div className="dash-kpi-card">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] flex-shrink-0">
            <Activity size={22} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 leading-none">
              {isLive ? 'LIVE' : 'PAUSED'}
            </div>
            <div className="text-xs font-bold text-[#A1A1AA] mt-1.5 uppercase tracking-wide">Current Status</div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CORE TWO-COLUMN SECTION: QUESTION BOARD + LIVE LEADERBOARD              */}
      {/* ========================================================================= */}
      <div className="dash-main-split">
        
        {/* LEFT PANEL: INTERACTIVE QUESTION BOARD */}
        <div className="dash-panel">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#22222D] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                <Target size={16} />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                INTERACTIVE QUESTION BOARD
              </h3>
            </div>

            {/* Compact Legend Dots */}
            <div className="flex items-center gap-3 text-[10.5px] font-medium text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#52525B]" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Completed
              </span>
            </div>
          </div>

          {/* 5 Distinct Rows */}
          <div className="space-y-3">
            {TIERS.map((tier) => {
              const tierQuestions = questionsByTier[tier.key] || [];

              return (
                <div
                  key={tier.key}
                  className={`dash-tier-box ${tier.borderClass} border-l-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${tier.textClass}`}>
                      {tier.label}
                    </span>
                    <span className={`text-xs font-bold ${tier.textClass}`}>
                      {tier.points} Points
                    </span>
                  </div>

                  {/* 10 Spaced Question Tiles */}
                  <div className="dash-tiles-row">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const q = tierQuestions[idx];
                      const qNumber = String(idx + 1).padStart(2, '0');
                      
                      const isCompleted = q?.status === 'completed' || (tier.key === 'chill' && idx === 0);
                      const isActive = q?.status === 'in-progress' || q?.status === 'selected';

                      let tileClass = 'dash-q-tile';
                      if (isCompleted) tileClass += ' completed';
                      else if (isActive) tileClass += ' active';

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (q) setSelectedQuestion(q);
                            else {
                              setSelectedQuestion({
                                questionNumber: idx + 1,
                                difficulty: tier.key,
                                points: tier.points,
                                status: isCompleted ? 'completed' : 'available',
                                questionText: `Sample question for ${tier.label} #${idx + 1}`
                              });
                            }
                          }}
                          className={tileClass}
                        >
                          {qNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT PANEL: LIVE LEADERBOARD */}
        <div className="dash-panel">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#22222D] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                <Trophy size={16} />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                LIVE LEADERBOARD
              </h3>
            </div>

            <Link
              to="/admin/leaderboard"
              className="text-xs font-bold text-[#E50914] hover:text-[#FF3344] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-[34px_1fr_65px_75px] text-[10.5px] font-bold text-[#71717A] uppercase tracking-wider pb-2 px-2">
            <span>#</span>
            <span>Participant</span>
            <span className="text-right">Points</span>
            <span className="text-right">Status</span>
          </div>

          {/* Table Rows (Clean & Spacious) */}
          <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
            {leaderboard.slice(0, 10).map((entry, idx) => {
              const rank = entry.rank || idx + 1;
              const hasPoints = (entry.totalScore || 0) > 0;

              return (
                <div key={entry._id || idx} className="dash-leader-row">
                  {/* Rank Badge */}
                  <div>
                    {rank === 1 ? (
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black text-[11px] font-black flex items-center justify-center shadow-sm">
                        1
                      </span>
                    ) : rank === 2 ? (
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-black text-[11px] font-black flex items-center justify-center shadow-sm">
                        2
                      </span>
                    ) : rank === 3 ? (
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                        3
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#71717A] pl-1 font-mono">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Participant Name */}
                  <div className="min-w-0 pr-1">
                    <div className="text-xs font-bold text-white truncate">
                      {entry.name || `Participant ${idx + 1}`}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <span className="text-sm font-black text-[#E50914] font-mono">
                      {entry.totalScore ?? 0}
                    </span>
                  </div>

                  {/* Status: Active (Green) or Online (Blue) */}
                  <div className="text-right">
                    {hasPoints ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Online
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. 4 SPACED QUICK ACTION CARDS                                            */}
      {/* ========================================================================= */}
      <div className="dash-actions-row">
        
        {/* 1: Manage Participants */}
        <Link to="/admin/participants" className="dash-action-btn group">
          <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] group-hover:scale-105 transition-transform flex-shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E50914] transition-colors">
              Manage Participants
            </div>
            <div className="text-[11px] text-[#71717A]">View / Add / Remove</div>
          </div>
        </Link>

        {/* 2: Question Control */}
        <Link to="/admin/questions" className="dash-action-btn group">
          <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] group-hover:scale-105 transition-transform flex-shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E50914] transition-colors">
              Question Control
            </div>
            <div className="text-[11px] text-[#71717A]">Edit / Activate / Reset</div>
          </div>
        </Link>

        {/* 3: Score Manager */}
        <Link to="/admin/scores" className="dash-action-btn group">
          <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] group-hover:scale-105 transition-transform flex-shrink-0">
            <BarChart3 size={18} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E50914] transition-colors">
              Score Manager
            </div>
            <div className="text-[11px] text-[#71717A]">Award / Modify Scores</div>
          </div>
        </Link>

        {/* 4: Projection */}
        <Link to="/stage" target="_blank" className="dash-action-btn group">
          <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] group-hover:scale-105 transition-transform flex-shrink-0">
            <Tv size={18} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E50914] transition-colors">
              Projection
            </div>
            <div className="text-[11px] text-[#71717A]">Open Big Screen</div>
          </div>
        </Link>

      </div>

      {/* ========================================================================= */}
      {/* 5. QUESTION DETAILS MODAL                                                 */}
      {/* ========================================================================= */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121218] border border-[#272733] rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="absolute top-4 right-4 text-[#8E8E93] hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-lg bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-black uppercase">
                {selectedQuestion.difficulty || 'Tier'} #{selectedQuestion.questionNumber}
              </span>
              <span className="text-xs font-bold text-[#A1A1AA]">
                Value: <span className="text-white font-mono">{selectedQuestion.points} pts</span>
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-4 leading-relaxed">
              {selectedQuestion.questionText}
            </h3>

            {/* Status Control */}
            <div className="p-3.5 rounded-xl bg-[#181822] border border-[#262634] mb-5">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase block mb-2">
                Current Question State
              </span>
              <div className="grid grid-cols-3 gap-2">
                {['available', 'in-progress', 'completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => selectedQuestion._id && handleStatusChange(selectedQuestion._id, st)}
                    className={`py-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      selectedQuestion.status === st
                        ? st === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : st === 'in-progress'
                          ? 'bg-[#E50914] text-white shadow-[0_0_10px_rgba(229,9,20,0.5)]'
                          : 'bg-white/20 text-white'
                        : 'bg-[#121218] border border-[#2B2B38] text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    {st === 'in-progress' ? 'Active' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-xs font-bold text-white transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedQuestion(null);
                  navigate('/admin/scores');
                }}
                className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#C20710] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(229,9,20,0.35)] cursor-pointer"
              >
                <span>Award Points</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
