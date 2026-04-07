import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Scale } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const auth = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const success = await auth.login(username, password);
      if (success) navigate('/dashboard');
      else setError('Invalid credentials');
    } else {
      const success = await auth.register(username, password);
      if (success) {
        setIsLogin(true);
        setError('Registration successful! Please login.');
      } else {
        setError('Registration failed. Username may exist.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg relative overflow-hidden font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md p-10 bg-brand-surface/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/30 transform rotate-3 hover:rotate-0 transition-transform">
            <Scale className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Courtroom Sim
          </h1>
          <p className="text-gray-300 font-medium mt-3 text-base">Enter the virtual chambers</p>
        </div>

        {error && (
          <div className="mb-6 text-sm text-white font-semibold bg-red-500/80 p-4 rounded-xl text-center shadow-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border-2 border-brand-border rounded-xl px-5 py-4 text-white text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-brand-text-muted"
              placeholder="e.g. JudgeJudy"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border-2 border-brand-border rounded-xl px-5 py-4 text-white text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-brand-text-muted"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(168,85,247,0.4)]"
          >
            {isLogin ? 'Enter Chambers' : 'Register Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-base text-gray-300 font-medium">
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary hover:text-white font-bold transition-colors underline underline-offset-4"
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
