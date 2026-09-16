import { useState, useEffect } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useSocket } from '../../context/SocketContext';
import { getEventStatus } from '../../services/eventService';
import { getQuestions, updateQuestionStatus } from '../../services/questionService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Trophy,
  Zap,
  Maximize,
  ArrowLeft,
  Flame,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const TIERS = [
  { key: 'chill', label: 'EASY', points: 5, color: '#10B981', tierClass: 'tier-box-chill', badgeBg: 'bg-emerald-500/15', badgeBorder: 'border-emerald-500/40', textCol: 'text-emerald-400' },
  { key: 'blaze', label: 'MEDIUM', points: 10, color: '#F59E0B', tierClass: 'tier-box-blaze', badgeBg: 'bg-amber-500/15', badgeBorder: 'border-amber-500/40', textCol: 'text-amber-400' },
  { key: 'savage', label: 'HARD', points: 15, color: '#F97316', tierClass: 'tier-box-savage', badgeBg: 'bg-orange-500/15', badgeBorder: 'border-orange-500/40', textCol: 'text-orange-400' },
  { key: 'brutal', label: 'HARDEST', points: 20, color: '#EF4444', tierClass: 'tier-box-brutal', badgeBg: 'bg-red-500/15', badgeBorder: 'border-red-500/40', textCol: 'text-red-400' },
  { key: 'legendary', label: 'SUPREME', points: 25, color: '#A855F7', tierClass: 'tier-box-legendary', badgeBg: 'bg-purple-500/15', badgeBorder: 'border-purple-500/40', textCol: 'text-purple-400' }
];

const LeaderboardProjector = () => {
  const { leaderboard, loading } = useLeaderboard();
  const { socket } = useSocket();
  const [eventStatus, setEventStatus] = useState('running');
  const [lastScored, setLastScored] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    getEventStatus()
      .then(res => setEventStatus(res.data.status))
      .catch(console.error);

    getQuestions()
      .then(res => {
        setQuestions(res.data || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('event:statusChanged', data => setEventStatus(data.status));

    socket.on('score:updated', data => {
      setLastScored(data.participantId);
      setTimeout(() => setLastScored(null), 3500);
    });

    socket.on('question:statusChanged', updatedQ => {
      setQuestions(prev => prev.map(q => (q._id === updatedQ._id ? updatedQ : q)));
      if (updatedQ.status === 'selected' || updatedQ.status === 'in-progress') {
        setActiveQuestion(updatedQ);
      }
    });

    socket.on('questions:reset', () => {
      getQuestions().then(res => setQuestions(res.data || [])).catch(console.error);
      setActiveQuestion(null);
    });

    return () => {
      socket.off('event:statusChanged');
      socket.off('score:updated');
      socket.off('question:statusChanged');
      socket.off('questions:reset');
    };
  }, [socket]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const handleSelectQuestion = async (q) => {
    setActiveQuestion(q);
    try {
      await updateQuestionStatus(q._id, 'selected');
      toast.success(`Projecting Question #${q.questionNumber} (${q.difficulty.toUpperCase()})`);
    } catch (err) {
      // Still display on projector even if status endpoint requires auth
    }
  };

  const handleMarkCompleted = async () => {
    if (!activeQuestion) return;
    try {
      await updateQuestionStatus(activeQuestion._id, 'completed');
      setQuestions(prev => prev.map(q => q._id === activeQuestion._id ? { ...q, status: 'completed' } : q));
      toast.success('Question marked as completed');
    } catch (err) {
      // Handle error gracefully
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuestion || questions.length === 0) return;
    const currentIndex = questions.findIndex(q => q._id === activeQuestion._id);
    const nextQ = questions[(currentIndex + 1) % questions.length];
    handleSelectQuestion(nextQ);
  };

  const handlePrevQuestion = () => {
    if (!activeQuestion || questions.length === 0) return;
    const currentIndex = questions.findIndex(q => q._id === activeQuestion._id);
    const prevIndex = (currentIndex - 1 + questions.length) % questions.length;
    const prevQ = questions[prevIndex];
    handleSelectQuestion(prevQ);
  };

  if (loading) return <LoadingSpinner text="Connecting to Auditorium Stage Feed..." />;

  const top1 = leaderboard[0];

  const currentTierInfo = activeQuestion
    ? TIERS.find(t => t.key === activeQuestion.difficulty) || { label: activeQuestion.difficulty?.toUpperCase(), points: activeQuestion.points, color: '#E50914' }
    : null;

  return (
    <div className="projector-container">
      {/* Red Ambient Glow Spots */}
      <div className="absolute -top-32 left-1/4 w-[50rem] h-[25rem] bg-[#E50914]/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[35rem] h-[20rem] bg-[#E50914]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP STAGE HEADER                                                       */}
      {/* ========================================================================= */}
      <header className="projector-header">
        
        {/* Left Brand & Exit */}
        <div className="flex items-center gap-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111116] hover:bg-[#1A1A24] border border-[#272736] hover:border-[#E50914] text-xs font-bold text-[#A1A1AA] hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={14} className="text-[#E50914]" />
            <span>Exit to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914] to-[#80050B] flex items-center justify-center text-white shadow-[0_0_18px_rgba(229,9,20,0.6)]">
              <Zap size={20} className="fill-current text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-white tracking-wider uppercase">
                  Fun<span className="text-[#E50914]">Buzz</span>
                </h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A0A0C] border border-[#E50914]/50 shadow-[0_0_10px_rgba(229,9,20,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse shadow-[0_0_8px_#E50914]" />
                  <span className="text-[10px] font-black text-[#FF3B47] uppercase tracking-wider">
                    LIVE
                  </span>
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                    STAGE PROJECTOR
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                Dual Broadcast: 70% Question Stage &bull; 30% Live Leaderboard
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Red-Themed Fullscreen & Board Toggle */}
        <div className="flex items-center gap-3">
          {activeQuestion && (
            <button
              onClick={() => setActiveQuestion(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14141C] border border-[#282838] hover:border-[#E50914] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <LayoutGrid size={14} className="text-[#E50914]" />
              <span>Show All 50 Questions</span>
            </button>
          )}

          <button
            onClick={toggleFullScreen}
            className="btn-primary py-2 px-4 text-xs font-bold"
          >
            <Maximize size={14} className="stroke-[2.5]" />
            <span>Fullscreen</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. DUAL 70/30 DISPLAY                                                     */}
      {/* ========================================================================= */}
      <div className="projector-split-layout">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: 70% SCREEN WIDTH                                          */}
        {/* ======================================================================= */}
        <div className="projector-question-section">
          
          {/* SCENARIO A: SINGLE QUESTION SELECTED -> DISPLAY PROMPT BIG */}
          {activeQuestion ? (
            <div className="flex flex-col justify-between h-full space-y-6 animate-fade-in">
              
              {/* Question Header Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#20202C]">
                <div className="flex items-center gap-3">
                  {/* Back to All Questions Button */}
                  <button
                    onClick={() => setActiveQuestion(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14141C] border border-[#2A2A38] hover:border-[#E50914] text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                  >
                    <ArrowLeft size={14} className="text-[#E50914]" />
                    <span>Back to 50 Questions</span>
                  </button>

                  {/* Tier Badge */}
                  <div
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm"
                    style={{
                      backgroundColor: `${currentTierInfo?.color}25`,
                      borderColor: currentTierInfo?.color,
                      color: '#FFFFFF'
                    }}
                  >
                    {currentTierInfo?.label} TIER
                  </div>

                  {/* Question Number */}
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider bg-[#14141C] px-3.5 py-2 rounded-xl border border-[#232330]">
                    QUESTION {String(activeQuestion.questionNumber).padStart(2, '0')}
                  </span>
                </div>

                {/* Points Badge & Current Status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14141C] border border-[#E50914]/50 shadow-[0_0_18px_rgba(229,9,20,0.3)]">
                    <Flame size={16} className="text-[#E50914] fill-current" />
                    <span className="text-lg font-black font-mono text-[#E50914] tracking-tight">
                      {activeQuestion.points} POINTS
                    </span>
                  </div>
                </div>
              </div>

              {/* Big Stage Question Text Display */}
              <div className="flex-1 flex flex-col justify-center py-8 my-auto">
                <div className="text-[12px] font-mono font-bold text-[#71717A] uppercase tracking-[0.25em] flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
                  AUDITORIUM CHALLENGE PROMPT
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                  {activeQuestion.questionText}
                </h2>
              </div>

              {/* Admin Completion Control Bar */}
              <div className="p-4.5 rounded-2xl bg-[#12121A] border border-[#252535] flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                    Question State:
                  </span>
                  {activeQuestion.status === 'completed' ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      Completed (Locked from visiting)
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-950/50 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Active / In Progress
                    </span>
                  )}
                </div>

                {/* Choice whether it is completed */}
                <div className="flex items-center gap-3">
                  {activeQuestion.status !== 'completed' ? (
                    <button
                      type="button"
                      onClick={handleMarkCompleted}
                      className="btn-primary py-2.5 px-5 text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <CheckCircle2 size={16} className="stroke-[2.5]" />
                      <span>Mark as Completed</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-[#71717A] italic">
                      Question completed &bull; Locked on stage
                    </span>
                  )}

                  <button
                    onClick={() => setActiveQuestion(null)}
                    className="btn-secondary py-2.5 px-4 text-xs cursor-pointer"
                  >
                    <LayoutGrid size={14} />
                    <span>Return to Board</span>
                  </button>
                </div>
              </div>

              {/* Navigation Bottom Bar */}
              <div className="pt-3 border-t border-[#1E1E2A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevQuestion}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14141C] border border-[#272738] hover:border-[#E50914] text-xs font-bold text-white hover:bg-[#1A1A26] transition-all cursor-pointer shadow-sm"
                  >
                    <ChevronLeft size={15} />
                    <span>Prev Question</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14141C] border border-[#272738] hover:border-[#E50914] text-xs font-bold text-white hover:bg-[#1A1A26] transition-all cursor-pointer shadow-sm"
                  >
                    <span>Next Question</span>
                    <ChevronRight size={15} />
                  </button>
                </div>

                <span className="text-xs font-mono text-[#71717A]">
                  Auditorium Presentation View
                </span>
              </div>

            </div>
          ) : (
            /* SCENARIO B: DEFAULT VIEW — SHOW ALL 50 QUESTIONS ORGANIZED BY TIERS */
            <div className="flex flex-col h-full gap-4 animate-fade-in">
              
              {/* Header Bar of Question Board */}
              <div className="flex items-center justify-between pb-3 border-b border-[#20202C]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#E50914] uppercase">
                      INTERACTIVE AUDITORIUM BOARD
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    ALL 50 QUESTIONS &bull; SELECT TO BROADCAST
                  </h2>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-bold text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#064e3b] border border-[#059669]" /> Easy (5p)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#78350f] border border-[#d97706]" /> Medium (10p)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#7c2d12] border border-[#ea580c]" /> Hard (15p)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#7f1d1d] border border-[#dc2626]" /> Hardest (20p)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#581c87] border border-[#9333ea]" /> Supreme (25p)
                  </span>
                </div>
              </div>

              {/* 5 Tier Rows with Dark Colored Boxes (NO LITE SHADES, ONLY INDEX DISPLAYED) */}
              <div className="flex-1 flex flex-col justify-between py-1 gap-3.5 overflow-y-auto">
                {TIERS.map(tier => {
                  const tierQuestions = questions
                    .filter(q => q.difficulty === tier.key)
                    .sort((a, b) => a.questionNumber - b.questionNumber);

                  return (
                    <div
                      key={tier.key}
                      className="p-4 rounded-2xl bg-[#0D0D14] border border-[#1E1E2A] shadow-md flex flex-col justify-between"
                    >
                      {/* Tier Row Label */}
                      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#1A1A26]">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="px-3 py-1 rounded-lg text-xs font-black uppercase font-mono border"
                            style={{
                              backgroundColor: `${tier.color}25`,
                              borderColor: tier.color,
                              color: '#FFFFFF'
                            }}
                          >
                            {tier.label} TIER
                          </span>
                          <span className="text-[11px] text-[#71717A] font-mono">10 Questions</span>
                        </div>
                        <span
                          className="text-xs font-mono font-black"
                          style={{ color: tier.color }}
                        >
                          {tier.points} Points Each
                        </span>
                      </div>

                      {/* 10 Dark Colored Question Tiles (ONLY INDEX DISPLAYED, NO POINTS INSIDE) */}
                      <div className="grid grid-cols-10 gap-2.5">
                        {tierQuestions.map(q => {
                          const isCompleted = q.status === 'completed';
                          const isSelected = q.status === 'selected' || q.status === 'in-progress';

                          return (
                            <button
                              key={q._id}
                              type="button"
                              disabled={isCompleted}
                              onClick={() => handleSelectQuestion(q)}
                              className={`h-12 rounded-xl font-mono text-sm font-black transition-all flex items-center justify-center ${
                                isCompleted
                                  ? 'tier-box-completed cursor-not-allowed'
                                  : `${tier.tierClass} cursor-pointer hover:scale-105 active:scale-95`
                              } ${isSelected ? 'active ring-2 ring-white/60' : ''}`}
                              title={isCompleted ? `Question ${q.questionNumber} is completed (locked)` : `Click to project Q${q.questionNumber}`}
                            >
                              <span>
                                {String(q.questionNumber).padStart(2, '0')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Instructions */}
              <div className="pt-2 border-t border-[#1E1E28] flex items-center justify-between text-xs text-[#8E8E93] font-mono">
                <span>&bull; Click any question above to project it. Completed questions are locked and cannot be revisited.</span>
                <span className="text-emerald-400 font-bold">50 Questions Managed</span>
              </div>

            </div>
          )}

        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: 30% SCREEN WIDTH — LIVE SCOREBOARD                       */}
        {/* ======================================================================= */}
        <div className="projector-scoreboard-section">
          
          {/* Scoreboard Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#20202C] mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                <Trophy size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  LIVE SCOREBOARD
                </h3>
                <span className="text-[10px] font-mono text-[#8E8E93]">
                  {leaderboard.length} Contestants Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                Real-Time
              </span>
            </div>
          </div>

          {/* Top 1 Champion Card */}
          {top1 && (
            <div className="bg-gradient-to-r from-[#1A0A0C] via-[#12121A] to-[#1A0A0C] border border-[#E50914]/60 rounded-2xl p-3.5 mb-3 shadow-[0_0_20px_rgba(229,9,20,0.25)] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E50914] text-white flex items-center justify-center text-xl shadow-[0_0_12px_#E50914] font-bold">
                    🥇
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#E50914]">
                      CURRENT LEADER
                    </span>
                    <h4 className="text-sm font-black text-white leading-tight truncate max-w-[130px]">
                      {top1.name}
                    </h4>
                    <span className="text-[10px] font-mono text-[#8E8E93]">
                      {top1.rollNumber}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-[#E50914] font-mono">
                    {top1.totalScore}
                  </span>
                  <span className="text-[9px] font-bold text-[#A1A1AA] ml-1 uppercase">
                    PTS
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Standings Table Header */}
          <div className="grid grid-cols-[30px_1fr_60px] text-[10px] font-bold text-[#71717A] uppercase tracking-wider pb-2 px-2">
            <span>#</span>
            <span>Participant</span>
            <span className="text-right">Score</span>
          </div>

          {/* Scrollable Leaderboard Rows */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {leaderboard.map((entry, idx) => {
              const rank = entry.rank || idx + 1;
              const isUpdated = lastScored === entry.participantId;
              const isTop = rank === 1;

              return (
                <div
                  key={entry.participantId || idx}
                  className={`projector-score-row ${isUpdated ? 'updated' : ''}`}
                >
                  <div className="w-6 text-center">
                    {rank === 1 ? (
                      <span className="text-xs">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-xs">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-xs">🥉</span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#71717A]">
                        #{rank}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 px-2">
                    <div className="text-xs font-bold text-white truncate">
                      {entry.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#71717A]">
                      {entry.rollNumber}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`text-sm font-black ${
                        isTop ? 'text-[#E50914]' : 'text-white'
                      }`}
                    >
                      {entry.totalScore ?? 0}
                    </span>
                    <span className="text-[9px] text-[#71717A] ml-1 uppercase">
                      pt
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};

export default LeaderboardProjector;
