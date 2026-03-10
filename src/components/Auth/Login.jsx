import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login fehlgeschlagen');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-5">
      <div className="bg-[#242424] rounded-xl p-10 w-full max-w-[420px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-[#2ea043] text-[28px] font-semibold mb-2">
            Roots Configurator
          </h1>
          <h2 className="text-white/87 text-xl font-normal">
            Login
          </h2>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive/80 px-4 py-3 rounded-md mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-white/87 text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              className="bg-[#1a1a1a] border-white/20 text-white/87 text-[15px] focus-visible:ring-[#2ea043] focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-white/87 text-sm font-medium">
              Passwort
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-[#1a1a1a] border-white/20 text-white/87 text-[15px] focus-visible:ring-[#2ea043] focus-visible:ring-offset-0"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-[#2ea043] hover:bg-[#26843a] text-white font-semibold text-[15px] mt-2 h-12 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(46,160,67,0.3)] active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? 'Wird eingeloggt...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Noch kein Account?{' '}
            <Link to="/register" className="text-[#2ea043] font-medium hover:text-[#26843a] hover:underline transition-colors">
              Registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
