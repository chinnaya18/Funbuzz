import { useState, useEffect } from 'react';
import { getQuestions, updateQuestion, updateQuestionStatus, createQuestion, deleteQuestion, resetAllQuestions } from '../../services/questionService';
import { DIFFICULTIES, QUESTION_STATUSES } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { HelpCircle, X, Save, RotateCcw, Plus, Trash2, Edit3 } from 'lucide-react';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQ, setSelectedQ] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ questionText: '', points: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({ difficulty: 'chill', questionNumber: 1, questionText: '', points: 5 });
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    try {
      const res = await getQuestions();
      setQuestions(res.data);
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (q, newStatus) => {
    try {
      await updateQuestionStatus(q._id, newStatus);
      setQuestions(prev => prev.map(item =>
        item._id === q._id ? { ...item, status: newStatus } : item
      ));
      if (selectedQ?._id === q._id) {
        setSelectedQ(prev => ({ ...prev, status: newStatus }));
      }
      toast.success(`${q.questionId} → ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await updateQuestion(selectedQ._id, editData);
      setQuestions(prev => prev.map(item =>
        item._id === selectedQ._id ? res.data : item
      ));
      setSelectedQ(res.data);
      setEditMode(false);
      toast.success('Question updated');
    } catch (err) {
      toast.error('Failed to update question');
    }
  };

  const handleCreate = async () => {
    try {
      const res = await createQuestion(createData);
      setQuestions(prev => [...prev, res.data]);
      setShowCreate(false);
      setCreateData({ difficulty: 'chill', questionNumber: 1, questionText: '', points: 5 });
      toast.success('Question created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create question');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q._id !== id));
      setConfirmDelete(null);
      if (selectedQ?._id === id) setSelectedQ(null);
      toast.success('Question deleted');
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  const handleResetAll = async () => {
    try {
      await resetAllQuestions();
      setQuestions(prev => prev.map(q => ({ ...q, status: 'available' })));
      setConfirmReset(false);
      toast.success('All questions reset to available');
    } catch (err) {
      toast.error('Failed to reset questions');
    }
  };

  if (loading) return <LoadingSpinner text="Loading question vault..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', paddingBottom: '40px' }} className="animate-fade-in">
      {/* Header with clear border and spacing */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid #222230', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#E50914] uppercase">
              QUESTION REPOSITORY
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <span>QUESTION MANAGEMENT</span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#13131A] text-[#A1A1AA] border border-[#272736]">
              {questions.length} questions loaded
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Add Question</span>
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="btn-secondary"
          >
            <RotateCcw size={14} />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Categories Question Board with Separated, Non-Colliding Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {DIFFICULTIES.map(diff => {
          const diffQuestions = questions
            .filter(q => q.difficulty === diff.key)
            .sort((a, b) => a.questionNumber - b.questionNumber);

          const tierMap = {
            chill: { color: '#10B981', label: 'EASY', pts: 5, boxClass: 'tier-box-chill' },
            blaze: { color: '#F59E0B', label: 'MEDIUM', pts: 10, boxClass: 'tier-box-blaze' },
            savage: { color: '#F97316', label: 'HARD', pts: 15, boxClass: 'tier-box-savage' },
            brutal: { color: '#EF4444', label: 'HARDEST', pts: 20, boxClass: 'tier-box-brutal' },
            legendary: { color: '#A855F7', label: 'SUPREME', pts: 25, boxClass: 'tier-box-legendary' }
          }[diff.key] || { color: '#E50914', label: diff.label, pts: diff.defaultPoints, boxClass: 'tier-box-chill' };

          return (
            <div
              key={diff.key}
              style={{
                backgroundColor: '#0E0E16',
                border: '1px solid #222232',
                borderLeft: `5px solid ${tierMap.color}`,
                borderRadius: '18px',
                padding: '24px 28px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #1C1C28' }}>
                <div className="flex items-center gap-3">
                  <span
                    className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase font-mono border"
                    style={{
                      backgroundColor: `${tierMap.color}15`,
                      borderColor: `${tierMap.color}60`,
                      color: tierMap.color
                    }}
                  >
                    {tierMap.label} TIER
                  </span>
                  <span className="text-xs text-[#8E8E93] font-mono">
                    {diffQuestions.length} Questions
                  </span>
                </div>
                <span
                  className="text-xs font-mono font-black"
                  style={{ color: tierMap.color }}
                >
                  {tierMap.pts} Points Each
                </span>
              </div>

              {/* 10 Dark Colored Question Buttons with spacing */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                {diffQuestions.map(q => {
                  const isInProg = q.status === 'in-progress' || q.status === 'selected';
                  const isCompleted = q.status === 'completed';

                  return (
                    <button
                      key={q._id}
                      type="button"
                      onClick={() => {
                        setSelectedQ(q);
                        setEditMode(false);
                        setEditData({ questionText: q.questionText, points: q.points });
                      }}
                      className={`h-12 rounded-xl font-mono font-black text-sm transition-all cursor-pointer flex items-center justify-center ${
                        isCompleted
                          ? 'tier-box-completed'
                          : `${tierMap.boxClass} hover:scale-105 active:scale-95`
                      } ${
                        isInProg
                          ? 'active ring-2 ring-white/60'
                          : ''
                      }`}
                      title={`Q${q.questionNumber}: ${q.status}`}
                    >
                      <span>{String(q.questionNumber).padStart(2, '0')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Question Detail / Edit Modal (80% of Screen) */}
      {selectedQ && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#0E0E16] border border-[#2A2A3C] rounded-3xl w-[92vw] sm:w-[85vw] lg:w-[80vw] max-w-6xl max-h-[88vh] flex flex-col p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.95)] animate-slide-up overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#222232] shrink-0">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914]">
                  {DIFFICULTIES.find(d => d.key === selectedQ.difficulty)?.label.toUpperCase()} &bull; QUESTION {String(selectedQ.questionNumber).padStart(2, '0')}
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-wider hidden sm:block">
                  Question Controller
                </h3>
              </div>
              <button
                onClick={() => setSelectedQ(null)}
                className="text-[#A1A1AA] hover:text-white p-2 rounded-xl hover:bg-[#1A1A26] border border-transparent hover:border-[#333346] transition-all cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1">
              {/* Status Change Pills */}
              <div className="bg-[#12121D] border border-[#202030] p-3 rounded-2xl shrink-0">
                <span className="text-[11px] font-mono font-bold text-[#A1A1AA] uppercase tracking-wider block mb-2">
                  Question State:
                </span>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {['available', 'in-progress', 'completed'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(selectedQ, status)}
                      className={`py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                        selectedQ.status === status
                          ? status === 'in-progress'
                            ? 'bg-[#E50914] text-white border-[#E50914] shadow-lg shadow-[#E50914]/30'
                            : status === 'completed'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                            : 'bg-white/15 text-white border-white/40'
                          : 'bg-[#161622] text-[#8E8E9A] border-[#262638] hover:text-white hover:border-[#3A3A50]'
                      }`}
                    >
                      {status === 'in-progress' ? 'Active' : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit / View Mode */}
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">Question Prompt</label>
                    <textarea
                      value={editData.questionText}
                      onChange={(e) => setEditData(prev => ({ ...prev, questionText: e.target.value }))}
                      rows={5}
                      className="input-primary w-full resize-none leading-relaxed text-base"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-[#A1A1AA] uppercase font-bold">Points:</label>
                    <input
                      type="number"
                      value={editData.points}
                      onChange={(e) => setEditData(prev => ({ ...prev, points: Number(e.target.value) }))}
                      className="w-28 input-primary font-mono text-base"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white text-xs font-bold uppercase cursor-pointer shadow-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-5 py-2.5 rounded-xl bg-[#161622] border border-[#2B2B3C] text-[#A1A1AA] text-xs font-bold uppercase cursor-pointer hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4">
                  {/* Generated Scenario Image (Large 80% screen proportion) */}
                  {selectedQ.imageUrl && (
                    <div className="w-full max-h-[48vh] min-h-[260px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-[#27273A] bg-[#07070D] flex items-center justify-center p-2.5 shadow-inner">
                      <img
                        src={selectedQ.imageUrl}
                        alt={selectedQ.questionId}
                        className="w-full h-full max-h-[46vh] object-contain rounded-xl select-none"
                        loading="eager"
                      />
                    </div>
                  )}

                  {/* Question Text Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#141420] border border-[#252536] shadow-md">
                    <span className="text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-widest block mb-1">
                      CHALLENGE PROMPT
                    </span>
                    <p className="text-base sm:text-lg lg:text-xl text-white font-bold leading-relaxed break-words">
                      {selectedQ.questionText}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3.5 border-t border-[#222232] shrink-0">
              <span className="text-sm sm:text-base font-mono font-black text-[#E50914] tracking-wider">
                {selectedQ.points} POINTS
              </span>

              {!editMode && (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 rounded-xl bg-[#181826] hover:bg-[#202032] border border-[#2E2E42] text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(selectedQ._id)}
                    className="px-4 py-2 rounded-xl bg-[#181826] hover:bg-[#2A1014] border border-[#2E2E42] hover:border-[#E50914] text-xs font-bold text-[#E50914] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">New Competition Question</h3>
              <button onClick={() => setShowCreate(false)} className="text-[#A1A1A1] hover:text-white p-1 rounded-lg hover:bg-[#161616] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={createData.difficulty}
                    onChange={(e) => setCreateData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="input-primary text-xs cursor-pointer py-2.5"
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d.key} value={d.key}>{d.label} Tier</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">Question # (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={createData.questionNumber}
                    onChange={(e) => setCreateData(prev => ({ ...prev, questionNumber: Number(e.target.value) }))}
                    className="input-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">Question Text / Prompt</label>
                <textarea
                  value={createData.questionText}
                  onChange={(e) => setCreateData(prev => ({ ...prev, questionText: e.target.value }))}
                  rows={3}
                  placeholder="Enter problem prompt..."
                  className="input-primary w-full resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">Points</label>
                <input
                  type="number"
                  value={createData.points}
                  onChange={(e) => setCreateData(prev => ({ ...prev, points: Number(e.target.value) }))}
                  className="w-28 input-primary font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full btn-primary justify-center"
                >
                  Create Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={confirmReset}
        title="Reset All Questions"
        message="This will reset all question states back to 'Available'. Contestant scores will remain intact."
        confirmText="Reset"
        onConfirm={handleResetAll}
        onCancel={() => setConfirmReset(false)}
        danger
      />
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Question"
        message="Are you sure you want to permanently delete this question?"
        confirmText="Delete"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        danger
      />
    </div>
  );
};

export default Questions;
