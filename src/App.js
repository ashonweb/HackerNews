import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const TABS = [
  { id: 'top',  label: 'Top',  endpoint: 'search?tags=story' },
  { id: 'new',  label: 'New',  endpoint: 'search_by_date?tags=story' },
  { id: 'ask',  label: 'Ask',  endpoint: 'search?tags=ask_hn' },
  { id: 'show', label: 'Show', endpoint: 'search?tags=show_hn' },
];

const BASE      = 'https://hn.algolia.com/api/v1/';
const PAGE_SIZE = 30;
const REFILL_AT = PAGE_SIZE + 8; // fetch more when remaining visible < this

function timeSince(dateStr) {
  const s = Math.floor((Date.now() - Date.parse(dateStr)) / 1000);
  if (s < 60)       return `${s}s`;
  if (s < 3600)     return `${Math.floor(s / 60)}m`;
  if (s < 86400)    return `${Math.floor(s / 3600)}h`;
  if (s < 2592000)  return `${Math.floor(s / 86400)}d`;
  if (s < 31536000) return `${Math.floor(s / 2592000)}mo`;
  return `${Math.floor(s / 31536000)}y`;
}

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return null; }
}

function ptsClass(n) {
  if (n >= 500) return 'pts-fire';
  if (n >= 100) return 'pts-warm';
  return 'pts-dim';
}

function timeClass(dateStr) {
  return (Date.now() - Date.parse(dateStr)) / 3600000 < 6 ? 'time-fresh' : '';
}

export default function App() {
  const [tab, setTab]             = useState('top');
  const [buffer, setBuffer]       = useState([]);   // all fetched stories for current tab
  const [apiPage, setApiPage]     = useState(0);    // next API page to request
  const [dispStart, setDispStart] = useState(0);    // index into visible[]
  const [loading, setLoading]     = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [updates, setUpdates]     = useState(
    () => JSON.parse(localStorage.getItem('hn_updates') || '{}')
  );

  const fetchingRef = useRef(false);
  const abortRef    = useRef(null);
  const tabRef      = useRef(tab);

  const doFetch = useCallback(async (tabId, pg, reset) => {
    if (fetchingRef.current) return;
    const t = TABS.find(x => x.id === tabId);
    if (!t) return;
    fetchingRef.current = true;
    setLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const res = await fetch(
        `${BASE}${t.endpoint}&hitsPerPage=${PAGE_SIZE}&page=${pg}`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();
      const hits = data.hits || [];
      setBuffer(prev => reset ? hits : [...prev, ...hits]);
      setApiPage(pg + 1);
    } catch (e) {
      // swallow abort errors
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      if (reset) setFirstLoad(false);
    }
  }, []);

  // Tab switch → full reset + fresh fetch
  useEffect(() => {
    tabRef.current = tab;
    setBuffer([]);
    setDispStart(0);
    setApiPage(0);
    setFirstLoad(true);
    doFetch(tab, 0, true);
  }, [tab]); // eslint-disable-line

  // Derived state
  const merged    = buffer.map(s => updates[s.objectID] ? { ...s, ...updates[s.objectID] } : s);
  const visible   = merged.filter(s => !s.hidden);
  const pageStories = visible.slice(dispStart, dispStart + PAGE_SIZE);
  const pageNum   = Math.floor(dispStart / PAGE_SIZE) + 1;
  const nHidden   = merged.length - visible.length;
  const remaining = visible.length - dispStart; // visible from current position onward

  // Auto-refill: when visible buffer near exhaustion, fetch next API page
  useEffect(() => {
    if (!fetchingRef.current && remaining < REFILL_AT) {
      doFetch(tabRef.current, apiPage, false);
    }
  }, [remaining, apiPage]); // eslint-disable-line

  const persist = (next) => {
    setUpdates(next);
    localStorage.setItem('hn_updates', JSON.stringify(next));
  };

  const upvote = (s) => {
    const cur = { ...(updates[s.objectID] || s) };
    if (cur.voted) return;
    persist({ ...updates, [s.objectID]: { ...cur, points: (cur.points || 0) + 1, voted: true } });
  };

  const hide = (s) => {
    persist({ ...updates, [s.objectID]: { ...(updates[s.objectID] || s), hidden: true } });
  };

  const unhideAll = () => {
    const next = {};
    Object.entries(updates).forEach(([k, v]) => { next[k] = { ...v, hidden: false }; });
    persist(next);
  };

  const goNext = () => {
    setDispStart(d => d + PAGE_SIZE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => {
    setDispStart(d => Math.max(0, d - PAGE_SIZE));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canPrev = dispStart > 0;
  const canNext = remaining > PAGE_SIZE;

  return (
    <div className="app">
      <header className="hdr">
        <div className="hdr-inner">
          <button
            className="logo"
            onClick={() => { setTab('top'); setDispStart(0); }}
            title="Back to top stories"
          >
            <span className="logo-y">Y</span>
            <span className="logo-text">Hacker News</span>
          </button>
          <nav className="tabs" role="tablist">
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`tab${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {firstLoad ? (
          <ul className="story-list" aria-label="Loading">
            {Array(14).fill(0).map((_, i) => (
              <li key={i} className="story skeleton">
                <div className="sk-rank" />
                <div className="sk-vote" />
                <div className="sk-body">
                  <div className="sk-title" style={{ width: `${52 + (i * 19) % 38}%` }} />
                  <div className="sk-meta" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <ol className="story-list">
              {pageStories.map((s, i) => {
                const domain = getDomain(s.url);
                const pts    = s.points || 0;
                const rank   = dispStart + i + 1;
                return (
                  <li key={s.objectID} className={`story${rank === 1 ? ' story-top' : ''}`}>
                    <span className="story-rank">{String(rank).padStart(2, '0')}</span>
                    <button
                      className={`vote-btn${s.voted ? ' voted' : ''}`}
                      onClick={() => upvote(s)}
                      title={s.voted ? 'Already upvoted' : 'Upvote'}
                      disabled={s.voted}
                      aria-label={`Upvote ${s.title}`}
                    >
                      <span className="vote-arrow">▲</span>
                      <span className={`vote-pts ${ptsClass(pts)}`}>{pts.toLocaleString()}</span>
                    </button>
                    <div className="story-body">
                      <div className="story-title-row">
                        <a
                          className="story-title"
                          href={s.url || `https://news.ycombinator.com/item?id=${s.objectID}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.title}
                        </a>
                        {domain && <span className="story-domain">{domain}</span>}
                      </div>
                      <div className="story-meta">
                        <span className="meta-author">{s.author}</span>
                        <span className="sep">·</span>
                        <span className={`meta-time ${timeClass(s.created_at)}`}>
                          {timeSince(s.created_at)} ago
                        </span>
                        <span className="sep">·</span>
                        <a
                          className="meta-comments"
                          href={`https://news.ycombinator.com/item?id=${s.objectID}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.num_comments ?? 0} comments
                        </a>
                        <span className="sep">·</span>
                        <button className="hide-btn" onClick={() => hide(s)}>[hide]</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {nHidden > 0 && (
              <div className="hidden-bar">
                <span>{nHidden} {nHidden === 1 ? 'story' : 'stories'} hidden</span>
                <button className="unhide-btn" onClick={unhideAll}>Show all</button>
              </div>
            )}

            <div className="pagination">
              <button className="page-btn" disabled={!canPrev} onClick={goPrev}>
                ← Prev
              </button>
              <span className="page-num">
                {loading ? <span className="page-loading">loading…</span> : `Page ${pageNum}`}
              </span>
              <button
                className={`page-btn${loading && !canNext ? ' btn-loading' : ''}`}
                disabled={!canNext && !loading}
                onClick={canNext ? goNext : undefined}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        Data from{' '}
        <a href="https://hn.algolia.com/api" target="_blank" rel="noreferrer">
          HN Algolia API
        </a>
      </footer>
    </div>
  );
}
