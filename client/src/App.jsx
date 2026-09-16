import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ParticipantLayout from './layouts/ParticipantLayout';
import ScorerLayout from './layouts/ScorerLayout';

// Auth pages
import UnifiedLogin from './pages/auth/UnifiedLogin';
import ParticipantLogin from './pages/auth/ParticipantLogin';
import AdminLogin from './pages/auth/AdminLogin';
import ScorerLogin from './pages/scorer/ScorerLogin';

// Scorer pages
import ScorerDashboard from './pages/scorer/ScorerDashboard';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Questions from './pages/admin/Questions';
import Participants from './pages/admin/Participants';
import ScoreManagement from './pages/admin/ScoreManagement';
import AdminLeaderboard from './pages/admin/Leaderboard';
import Settings from './pages/admin/Settings';

// Participant pages
import ParticipantDashboard from './pages/participant/Dashboard';

// Public Big Screen Projector
import LeaderboardProjector from './pages/public/LeaderboardProjector';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Unified Master Login & Landing */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={
                user?.role === 'admin' ? '/admin/dashboard' :
                user?.role === 'scorer' ? '/scorer/dashboard' :
                '/participant/dashboard'
              } />
            : <UnifiedLogin />
        }
      />

      <Route path="/login" element={<UnifiedLogin />} />

      {/* Admin Login Route */}
      <Route
        path="/admin/login"
        element={
          isAuthenticated && user?.role === 'admin'
            ? <Navigate to="/admin/dashboard" />
            : <Navigate to="/?tab=admin" replace />
        }
      />

      {/* Scorer / Mark Provider Login */}
      <Route
        path="/scorer/login"
        element={
          isAuthenticated && (user?.role === 'scorer' || user?.role === 'admin')
            ? <Navigate to="/scorer/dashboard" />
            : <Navigate to="/?tab=scorer" replace />
        }
      />

      {/* Stage / Projector Leaderboard - Accessible inside Admin login only */}
      <Route
        path="/stage"
        element={
          <ProtectedRoute requiredRole="admin">
            <LeaderboardProjector />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <LeaderboardProjector />
          </ProtectedRoute>
        }
      />

      {/* Admin Module */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="questions" element={<Questions />} />
        <Route path="participants" element={<Participants />} />
        <Route path="scores" element={<ScoreManagement />} />
        <Route path="leaderboard" element={<AdminLeaderboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Scorer / Mark Provider Module */}
      <Route
        path="/scorer"
        element={
          <ProtectedRoute requiredRole={['scorer', 'admin']}>
            <ScorerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<ScorerDashboard />} />
      </Route>

      {/* Participant Module */}
      <Route
        path="/participant"
        element={
          <ProtectedRoute requiredRole="participant">
            <ParticipantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<ParticipantDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#161616',
                color: '#FFFFFF',
                border: '1px solid #292929',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500
              },
              success: { iconTheme: { primary: '#E50914', secondary: '#161616' } },
              error: { iconTheme: { primary: '#E50914', secondary: '#161616' } }
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
