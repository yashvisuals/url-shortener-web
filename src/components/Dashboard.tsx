import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_URL, ME, MY_URLS, URL_STATS } from '../graphql';

type Url = {
  slug: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
};
type MyUrls = { myUrls: Url[] };
type MeData = { me: { id: number; email: string } };
type CreateData = { createUrl: { slug: string; originalUrl: string; clickCount: number } };
type Click = { ipAddress?: string | null; userAgent?: string | null; clickedAt: string };
type Stats = {
  urlStats: {
    slug: string;
    shortUrl: string;
    totalClicks: number;
    recentClicks: Click[];
  };
};

const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/graphql').replace(
  '/graphql',
  '',
);
const shortUrl = (slug: string) => `${apiBase}/r/${slug}`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button className="link" onClick={copy}>
      {copied ? 'copied!' : 'copy'}
    </button>
  );
}

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { data: meData } = useQuery<MeData>(ME);
  const { data, refetch } = useQuery<MyUrls>(MY_URLS);
  const [createUrl, { loading, error }] = useMutation<CreateData>(CREATE_URL);

  const [original, setOriginal] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [created, setCreated] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createUrl({
      variables: {
        input: {
          originalUrl: original,
          ...(customSlug ? { customSlug } : {}),
        },
      },
    });
    const slug = res.data?.createUrl.slug;
    if (slug) setCreated(slug);
    setOriginal('');
    setCustomSlug('');
    await refetch();
  };

  return (
    <div>
      <header className="topbar">
        <span>
          Signed in as <strong>{meData?.me.email ?? '...'}</strong>
        </span>
        <button className="link" onClick={onLogout}>
          Log out
        </button>
      </header>

      <div className="card">
        <h2>Shorten a URL</h2>
        <form onSubmit={submit}>
          <input
            type="url"
            placeholder="https://example.com/long/link"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="custom slug (optional)"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? '...' : 'Shorten'}
          </button>
        </form>
        {error && <p className="error">{error.message}</p>}

        {created && (
          <div className="created">
            <span>Your short link:</span>
            <a href={shortUrl(created)} target="_blank" rel="noreferrer">
              {shortUrl(created)}
            </a>
            <CopyButton text={shortUrl(created)} />
          </div>
        )}
      </div>

      <div className="card">
        <h2>Your links</h2>
        {!data?.myUrls.length && <p className="muted">No links yet.</p>}
        {data?.myUrls.map((u) => (
          <div key={u.slug} className="row">
            <div>
              <a href={shortUrl(u.slug)} target="_blank" rel="noreferrer">
                {shortUrl(u.slug)}
              </a>
              <div className="muted small">{u.originalUrl}</div>
            </div>
            <div className="meta">
              <span>{u.clickCount} clicks</span>
              <CopyButton text={shortUrl(u.slug)} />
              <button className="link" onClick={() => setSelected(u.slug)}>
                stats
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <StatsPanel
          slug={selected}
          onClose={() => setSelected(null)}
          onChange={() => refetch()}
        />
      )}
    </div>
  );
}

function StatsPanel({
  slug,
  onClose,
  onChange,
}: {
  slug: string;
  onClose: () => void;
  onChange: () => void;
}) {
  // network-only so reopening/refreshing always shows the latest clicks.
  const { data, loading, refetch } = useQuery<Stats>(URL_STATS, {
    variables: { slug },
    fetchPolicy: 'network-only',
  });

  const refresh = async () => {
    await refetch();
    onChange(); // keep the click counts in the list in sync too
  };

  return (
    <div className="card">
      <div className="topbar">
        <h2>Stats — {slug}</h2>
        <span>
          <button className="link" onClick={refresh}>
            refresh
          </button>{' '}
          <button className="link" onClick={onClose}>
            close
          </button>
        </span>
      </div>
      {loading && <p className="muted">Loading...</p>}
      {data && (
        <>
          <p>
            <strong>{data.urlStats.totalClicks}</strong> total clicks
          </p>
          {!data.urlStats.recentClicks.length && (
            <p className="muted">No clicks recorded yet.</p>
          )}
          {data.urlStats.recentClicks.map((c, i) => (
            <div key={i} className="row small">
              <span>{c.ipAddress ?? 'unknown ip'}</span>
              <span className="muted">{new Date(c.clickedAt).toLocaleString()}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
