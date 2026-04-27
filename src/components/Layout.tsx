import { useRef, useState, useMemo, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Boxes, Users, FolderGit2, GitBranch, Search, X, Upload, UserCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { searchEntities } from '../utils/derive';
import { ImportData } from '../views/ImportData';
import { Entity } from '../types';

function TypeIcon({ type }: { type: Entity['type'] }) {
	if (type === 'person') return <UserCircle2 size={12} />;
	if (type === 'project') return <FolderGit2 size={12} />;
	if (type === 'repo') return <GitBranch size={12} />;
	return <Boxes size={12} />;
}

export function Layout({ children }: { children: React.ReactNode }) {
	const { entities, isDemo, people, projects, squads, repos } = useData();
	const [search, setSearch] = useState('');
	const [activeIndex, setActiveIndex] = useState(-1);
	const [showSearch, setShowSearch] = useState(false);
	const [showImport, setShowImport] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				setShowSearch(true);
			}
		}

		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	useEffect(() => {
		if (showSearch) {
			setTimeout(() => searchRef.current?.focus(), 0);
		} else {
			setSearch('');
			setActiveIndex(-1);
		}
	}, [showSearch]);

	const searchResults = useMemo(() => {
		if (!search.trim()) return [];
		return searchEntities(entities, search).slice(0, 8);
	}, [search, entities]);

	function pad(n: number) {
		return String(n).padStart(2, '0');
	}

	function navigateTo(entity: Entity) {
		navigate(`/${entity.type}/${entity.id}`);
		setShowSearch(false);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setActiveIndex(prev => Math.min(prev + 1, searchResults.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActiveIndex(prev => Math.max(prev - 1, -1));
		} else if (e.key === 'Escape') {
			setShowSearch(false);
		} else if (e.key === 'Enter') {
			const hit = activeIndex >= 0 ? searchResults[activeIndex] : null;
			if (hit) {
				navigateTo(hit);
			} else if (search.trim()) {
				navigate(`/search?q=${encodeURIComponent(search.trim())}`);
				setShowSearch(false);
			}
		}
	}

	return (
		<div>
			<nav className='topbar'>
				<NavLink to='/' className='topbar__brand'>
					Team Map<span className='topbar__brand-dot'>.</span>
				</NavLink>

				<div className='topbar__nav'>
					<NavLink
						to='/' end
						className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
					>
						<span className='nav-item__icon'><Boxes size={14} /></span>
						Squads
						<span className='nav-item__count'>{pad(squads.length)}</span>
					</NavLink>
					<NavLink
						to='/roles'
						className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
					>
						<span className='nav-item__icon'><Users size={14} /></span>
						People
						<span className='nav-item__count'>{pad(people.length)}</span>
					</NavLink>
					<NavLink
						to='/projects'
						className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
					>
						<span className='nav-item__icon'><FolderGit2 size={14} /></span>
						Projects
						<span className='nav-item__count'>{pad(projects.length)}</span>
					</NavLink>
					<NavLink
						to='/repos'
						className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
					>
						<span className='nav-item__icon'><GitBranch size={14} /></span>
						Repos
						<span className='nav-item__count'>{pad(repos.length)}</span>
					</NavLink>
				</div>

				<div className='topbar__actions'>
					<button className='btn-outline' onClick={() => setShowImport(true)}>
						<Upload size={13} />
						IMPORT
					</button>
					<button
						className='topbar__icon-btn'
						onClick={() => setShowSearch(true)}
						aria-label='Search (⌘K)'
					>
						<Search size={15} />
					</button>
				</div>
			</nav>

			{isDemo && (
				<div className='demo-banner'>
					Showing sample data —{' '}
					<a onClick={() => setShowImport(true)}>import your own CSV files</a> to get
					started
				</div>
			)}

			<div className='page'>
				<main className='page-main'>{children}</main>
			</div>

			{showSearch && (
				<div className='overlay overlay--top search-overlay' onClick={() => setShowSearch(false)}>
					<div className='overlay__box overlay__box--narrow search-overlay__box' onClick={e => e.stopPropagation()}>
						<div className='search-overlay__input-wrap'>
              <span style={{ color: 'var(--muted)', display: 'flex', flexShrink: 0 }}>
                <Search size={16} />
              </span>
							<input
								ref={searchRef}
								className='search-overlay__input'
								value={search}
								onChange={e => {
									setSearch(e.target.value);
									setActiveIndex(-1);
								}}
								onKeyDown={handleKeyDown}
								placeholder='Search people, projects, squads…'
								aria-label='Search'
							/>
							{search ? (
								<button
									className='search-overlay__clear'
									onClick={() => setSearch('')}
									aria-label='Clear'
								>
									<X size={14} />
								</button>
							) : (
								<span className='search-overlay__esc'>ESC</span>
							)}
						</div>

						{searchResults.length > 0 && (
							<div className='search-overlay__results'>
								{searchResults.map((entity, idx) => (
									<button
										key={entity.id}
										className={`search-overlay__row${idx === activeIndex ? ' is-active' : ''}`}
										onMouseDown={() => navigateTo(entity)}
										onMouseEnter={() => setActiveIndex(idx)}
									>
                    <span className={`type-badge type-badge--${entity.type}`}>
                      <TypeIcon type={entity.type} />
						{entity.type}
                    </span>
										<div>
											<div className='search-overlay__name'>{entity.name}</div>
											{entity.meta && (
												<div className='search-overlay__meta'>{entity.meta}</div>
											)}
										</div>
									</button>
								))}
							</div>
						)}

						{search.trim() && searchResults.length === 0 && (
							<div className='search-overlay__empty'>
								No results for "{search}"
							</div>
						)}
					</div>
				</div>
			)}

			{showImport && (
				<ImportData onClose={() => setShowImport(false)} />
			)}
		</div>
	);
}
