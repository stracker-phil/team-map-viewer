import { FormEvent, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isDemo } = useData();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setQuery('');
    }
  }

  return (
    <div>
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="logo">
            <span className="logo-icon">◉</span>
            Team Map
          </Link>

          <nav className="nav">
            <NavLink to="/" end>Teams</NavLink>
            <NavLink to="/roles">Roles</NavLink>
            <NavLink to="/import">Import</NavLink>
          </nav>

          <form onSubmit={handleSearch} className="search-form">
            <span className="search-icon">⌕</span>
            <input
              type="search"
              className="search-input"
              placeholder="Search people, projects…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search"
            />
          </form>
        </div>
      </header>

      {isDemo && (
        <div className="demo-banner">
          Showing sample data —{' '}
          <Link to="/import">import your own CSV files</Link> to get started
        </div>
      )}

      <main className="main">{children}</main>
    </div>
  );
}
