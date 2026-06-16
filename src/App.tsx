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
      <h1>🔗 url-shortener</h1>
      {loggedIn ? (
        <Dashboard onLogout={logout} />
      ) : (
        <Auth onAuthed={() => setLoggedIn(true)} />
      )}
    </div>
  );
}
