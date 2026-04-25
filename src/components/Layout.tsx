import { useRef, useState, useMemo, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Boxes, Users, FolderGit2, Search, X, Upload, UserCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { byType, searchEntities } from '../utils/derive';
import { ImportData } from '../views/ImportData';
import { Entity } from '../types';

function TypeIcon({ type }: { type: Entity['type'] }) {
  if (type === 'person') return <UserCircle2 size={14} />;
  if (type === 'project') return <FolderGit2 size={14} />;
  return <Boxes size={14} />;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { entities, claims, isDemo } = useData();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showImport, setShowImport] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    }
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, []);

  const people = useMemo(() => byType(entities, 'person'), [entities]);
  const projects = useMemo(() => byType(entities, 'project'), [entities]);
  const squads = useMemo(() => byType(entities, 'squad'), [entities]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return searchEntities(entities, search).slice(0, 8);
  }, [search, entities]);

  function pad(n: number) {
    return String(n).padStart(2, '0');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      setFocused(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setSearch('');
      setFocused(false);
      setActiveIndex(-1);
    } else if (e.key === 'Enter') {
      const hit = activeIndex >= 0 ? searchResults[activeIndex] : null;
      if (hit) {
        navigate(`/${hit.type === 'person' ? 'person' : hit.type === 'project' ? 'project' : 'squad'}/${hit.id}`);
      } else if (search.trim()) {
        navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      }
      setSearch('');
      setFocused(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div>
      {isDemo && (
        <div className="demo-banner">
          Showing sample data —{' '}
          <a onClick={() => setShowImport(true)}>import your own CSV files</a> to get started
        </div>
      )}

      <div className="app-container">
        <header>
          <div className="app-header__top">
            <NavLink to="/" className="app-header__brand">
              <div className="app-header__eyebrow"></div>
              <h1 className="app-header__title">
                Team Map<span className="app-header__title-dot">.</span>
              </h1>
              <div className="app-header__subtitle">
                Who works here, on what, and in which team.
              </div>
            </NavLink>

            <div className="app-header__actions">
              <button className="btn-outline" onClick={() => setShowImport(true)}>
                <Upload size={13} />
                IMPORT
              </button>
            </div>
          </div>

          <nav className="app-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-item__icon"><Boxes size={14} /></span>
              Squads
              <span className="nav-item__count">{pad(squads.length)}</span>
            </NavLink>

            <NavLink
              to="/roles"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-item__icon"><Users size={14} /></span>
              People
              <span className="nav-item__count">{pad(people.length)}</span>
            </NavLink>

            <NavLink
              to="/projects"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-item__icon"><FolderGit2 size={14} /></span>
              Projects
              <span className="nav-item__count">{pad(projects.length)}</span>
            </NavLink>

            <div className="search-wrap">
              <div className="search-bar">
                <span className="search-bar__icon"><Search size={14} /></span>
                <input
                  ref={searchRef}
                  className="search-bar__input"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setActiveIndex(-1); setFocused(true); }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => { setFocused(false); setActiveIndex(-1); }, 150)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search people, projects, squads…"
                  aria-label="Search"
                />
                {search && (
                  <button className="search-bar__clear" onClick={() => setSearch('')} aria-label="Clear">
                    <X size={14} />
                  </button>
                )}
              </div>

              {focused && searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((entity, idx) => (
                    <button
                      key={entity.id}
                      className={`search-dropdown__item${idx === activeIndex ? ' is-active' : ''}`}
                      onMouseDown={() => {
                        navigate(`/${entity.type === 'person' ? 'person' : entity.type === 'project' ? 'project' : 'squad'}/${entity.id}`);
                        setSearch('');
                        setActiveIndex(-1);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <span style={{ color: 'var(--muted)', display: 'flex' }}>
                        <TypeIcon type={entity.type} />
                      </span>
                      <div>
                        <div className="search-dropdown__name">{entity.name}</div>
                        <div className="search-dropdown__meta">
                          {entity.type}{entity.meta ? ` · ${entity.meta}` : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </header>

        <main className="app-main">{children}</main>

        <footer className="app-footer">
          <span>TEAM MAP · V1</span>
          <span>{entities.length} ENTITIES · {claims.length} CLAIMS</span>
        </footer>
      </div>

      {showImport && (
        <ImportData onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
