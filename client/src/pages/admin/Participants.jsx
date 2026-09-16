import { useState, useEffect, useMemo } from 'react';
import { getParticipants, createParticipant, updateParticipant, deleteParticipant } from '../../services/participantService';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { Users, Search, Edit3, Trash2, X, Save, UserPlus, Filter, ArrowUpDown } from 'lucide-react';

const Participants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, not-started
  const [sortBy, setSortBy] = useState('rank'); // rank, name, roll
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', rollNumber: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { leaderboard } = useLeaderboard();

  useEffect(() => { fetchParticipants(); }, []);

  const fetchParticipants = async (searchTerm = '') => {
    try {
      const res = await getParticipants(searchTerm);
      setParticipants(res.data);
    } catch (err) {
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.rollNumber.trim()) {
      toast.error('Name and Roll Number are required');
      return;
    }
    try {
      const res = await createParticipant(formData);
      setParticipants(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setShowCreate(false);
      setFormData({ name: '', rollNumber: '' });
      toast.success('Participant added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create participant');
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await updateParticipant(id, formData);
      setParticipants(prev => prev.map(p => p._id === id ? res.data : p));
      setEditingId(null);
      setFormData({ name: '', rollNumber: '' });
      toast.success('Participant updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteParticipant(id);
      setParticipants(prev => prev.filter(p => p._id !== id));
      setConfirmDelete(null);
      toast.success('Participant deleted');
    } catch (err) {
      toast.error('Failed to delete participant');
    }
  };

  // Merge participant info with leaderboard score
  const processedParticipants = useMemo(() => {
    const list = participants.map(p => {
      const entry = leaderboard.find(e => e.participantId === p._id);
      const score = entry?.totalScore ?? 0;
      const rank = entry?.rank ?? '-';
      let status = 'Not Started';
      if (score > 30) status = 'Completed';
      else if (score > 0) status = 'Active';

      return {
        ...p,
        score,
        rank: typeof rank === 'number' ? rank : 999,
        displayRank: rank,
        status
      };
    });

    // Apply Search
    let filtered = list.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(search.toLowerCase())
    );

    // Apply Filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(p => p.status === 'Active' || p.status === 'Completed');
    } else if (statusFilter === 'not-started') {
      filtered = filtered.filter(p => p.status === 'Not Started');
    }

    // Apply Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'roll') return a.rollNumber.localeCompare(b.rollNumber);
      return a.rank - b.rank; // rank sort default
    });

    return filtered;
  }, [participants, leaderboard, search, statusFilter, sortBy]);

  if (loading) return <LoadingSpinner text="Loading contestants..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', paddingBottom: '40px' }} className="animate-fade-in">
      {/* Top Header with clean border */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid #222230', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#E50914] uppercase">
              CONTESTANT ROSTER
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <span>PARTICIPANTS</span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#13131A] text-[#A1A1AA] border border-[#272736]">
              {participants.length} registered contestants
            </span>
          </h1>
        </div>

        <button
          onClick={() => { setShowCreate(true); setFormData({ name: '', rollNumber: '' }); }}
          className="btn-primary"
        >
          <UserPlus size={16} className="stroke-[2.5]" />
          <span>Add Participant</span>
        </button>
      </div>

      {/* Action Bar Card: Search, Filter, Sort with clear borders & spacing */}
      <div
        style={{
          backgroundColor: '#0E0E16',
          border: '1px solid #222232',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contestant by name or roll number..."
            style={{ paddingLeft: '2.6rem' }}
            className="input-primary"
          />
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 1 200px' }}>
          <Filter size={15} className="text-[#71717A] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-primary text-xs cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active / Scored</option>
            <option value="not-started">Not Started</option>
          </select>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 1 220px' }}>
          <ArrowUpDown size={15} className="text-[#71717A] shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-primary text-xs cursor-pointer"
          >
            <option value="rank">Sort by Rank / Score</option>
            <option value="name">Sort by Name (A-Z)</option>
            <option value="roll">Sort by Roll Number</option>
          </select>
        </div>
      </div>

      {/* Participant Table or Empty State Card */}
      {processedParticipants.length === 0 ? (
        <div
          style={{
            backgroundColor: '#0E0E16',
            border: '1px solid #222232',
            borderRadius: '18px',
            padding: '48px 24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
          }}
        >
          <EmptyState icon={Users} title="No contestants match criteria" message="Adjust your search or filter options" />
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#0E0E16',
            border: '1px solid #222232',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#14141E', borderBottom: '1px solid #222232' }} className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C28] text-sm">
                {processedParticipants.map((p) => {
                  const isTop1 = p.rank === 1;
                  const rankDisplay = p.displayRank === 1 ? '🥇 #1' : p.displayRank === 2 ? '🥈 #2' : p.displayRank === 3 ? '🥉 #3' : `#${p.displayRank}`;

                  return (
                    <tr key={p._id} className="hover:bg-[#161616] transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold">
                        <span className={isTop1 ? 'text-[#E50914]' : p.score > 0 ? 'text-white' : 'text-[#666666]'}>
                          {rankDisplay}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {editingId === p._id ? (
                          <input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#292929] text-white text-sm focus:border-[#E50914] focus:outline-none"
                          />
                        ) : (
                          <span className="font-semibold text-white">{p.name}</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {editingId === p._id ? (
                          <input
                            value={formData.rollNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#292929] text-white text-sm focus:border-[#E50914] focus:outline-none font-mono"
                          />
                        ) : (
                          <span className="text-xs text-[#A1A1A1] font-mono px-2 py-0.5 rounded bg-[#161616] border border-[#292929]">
                            {p.rollNumber}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center font-mono font-bold text-sm">
                        <span className={p.score > 0 ? 'text-[#E50914]' : 'text-[#666666]'}>
                          {p.score} <span className="text-[10px] text-[#A1A1A1] font-normal">pts</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          p.status === 'Active'
                            ? 'bg-[#E50914]/15 border border-[#E50914]/40 text-[#E50914]'
                            : p.status === 'Completed'
                            ? 'bg-[#161616] border border-[#333333] text-white'
                            : 'bg-[#161616] border border-[#292929] text-[#666666]'
                        }`}>
                          {p.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />}
                          {p.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {editingId === p._id ? (
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => handleUpdate(p._id)} 
                              className="p-1.5 rounded-lg bg-[#E50914] text-white hover:bg-[#B20710] transition-colors"
                              title="Save"
                            >
                              <Save size={15} />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)} 
                              className="p-1.5 rounded-lg bg-[#161616] border border-[#292929] text-[#A1A1A1] hover:text-white transition-colors"
                              title="Cancel"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setEditingId(p._id); setFormData({ name: p.name, rollNumber: p.rollNumber }); }}
                              className="p-1.5 rounded-lg bg-[#161616] border border-[#292929] text-[#A1A1A1] hover:text-white hover:border-[#A1A1A1] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(p._id)}
                              className="p-1.5 rounded-lg bg-[#161616] border border-[#292929] text-[#A1A1A1] hover:text-[#E50914] hover:border-[#E50914]/40 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-[#111111] border border-[#292929] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#292929]">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Add Contestant</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[#161616] text-[#A1A1A1] hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">Participant Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Arun Kumar"
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A1A1A1] uppercase tracking-wider mb-1.5">Roll Number</label>
                <input
                  value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                  placeholder="e.g. 26MCA101"
                  className="input-primary font-mono"
                />
              </div>
              <button
                onClick={handleCreate}
                className="w-full btn-primary justify-center mt-2"
              >
                Add Contestant
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Participant"
        message="This will also delete their score record. This action cannot be undone."
        confirmText="Delete Participant"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        danger
      />
    </div>
  );
};

export default Participants;
