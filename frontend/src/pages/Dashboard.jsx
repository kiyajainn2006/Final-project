import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Play, LogIn, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-16 bg-brand-surface border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-md mt-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">Welcome, {user?.username}</h1>
            <p className="text-lg text-brand-text-muted font-medium">Ready to preside over your sessions?</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold px-6 py-3 rounded-xl transition-all border border-red-500/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Leave Chambers</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Session Card */}
          <div className="bg-brand-surface/80 border border-white/20 p-10 rounded-3xl backdrop-blur-xl shadow-xl hover:border-primary/50 transition-colors group">
            <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <Play className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">Initialize Session</h2>
            <p className="text-brand-text-muted text-lg font-medium mb-8">
              Start a new courtroom simulation and invite participants to join your hearing.
            </p>
            <button 
              onClick={() => navigate('/courtroom')}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all transform hover:-translate-y-1"
            >
              Start New Court Room
            </button>
          </div>
          
          {/* Join Session Card */}
          <div className="bg-brand-surface/80 border border-white/20 p-10 rounded-3xl backdrop-blur-xl shadow-xl hover:border-blue-500/50 transition-colors group">
            <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
              <LogIn className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">Join Session</h2>
            <p className="text-brand-text-muted text-lg font-medium mb-8">
              Enter a room ID provided by the judge or administrator to participate.
            </p>
            <input 
              type="text" 
              placeholder="e.g. ROOM-1234" 
              className="w-full bg-black/50 border-2 border-brand-border rounded-xl px-5 py-4 mb-6 text-white text-lg placeholder-brand-text-muted font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-1">
              Join Existing Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
