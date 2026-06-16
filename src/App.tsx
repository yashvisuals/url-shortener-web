import { useState } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { clearToken, client, getToken } from './apollo';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  const logout = async () => {
    clearToken();
    await client.clearStore();
    setLoggedIn(false);
  };

  return (
    <div className="app">
      <header className="brand">
        <div className="brand-mark">🔗</div>
        <h1>url-shortener</h1>
        <p className="tagline">Shorten links and track every click.</p>
      </header>
      {loggedIn ? (
        <Dashboard onLogout={logout} />
      ) : (
        <Auth onAuthed={() => setLoggedIn(true)} />
      )}
    </div>
  );
}
