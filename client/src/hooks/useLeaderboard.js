import { useState, useEffect, useCallback } from 'react';
import { getLeaderboard } from '../services/leaderboardService';
import { useSocket } from '../context/SocketContext';

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await getLeaderboard();
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data) => {
      setLeaderboard(data);
    };

    socket.on('leaderboard:updated', handleUpdate);

    return () => {
      socket.off('leaderboard:updated', handleUpdate);
    };
  }, [socket]);

  return { leaderboard, loading, refetch: fetchLeaderboard };
};
