import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LOGIN, REGISTER } from '../graphql';
import { setToken } from '../apollo';

type AuthResult = { login?: { accessToken: string }; register?: { accessToken: string } };

export function Auth({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [run, { loading, error }] = useMutation<AuthResult>(
    mode === 'login' ? LOGIN : REGISTER,
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await run({ variables: { input: { email, password } } });
    const token = res.data?.login?.accessToken ?? res.data?.register?.accessToken;
    if (token) {
      setToken(token);
      onAuthed();
    }
  };

  return (
    <div className="card">
      <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Log in' : 'Register'}
        </button>
      </form>

      {error && <p className="error">{error.message}</p>}

      <p className="muted">
        {mode === 'login' ? "No account?" : 'Already have an account?'}{' '}
        <button
          className="link"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Register' : 'Log in'}
        </button>
      </p>
    </div>
  );
}
