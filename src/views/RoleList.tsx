import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';
import { PersonItem } from '../components/PersonItem';
import { Entity } from '../types';

export function RoleList() {
	const { people } = useData();
	const { starred, isStarred } = useStar();
	const navigate = useNavigate();

	const allRoles = useMemo(() => {
		const counts = new Map<string, number>();
		people.forEach(p => {
			if (!p.meta) return;
			counts.set(p.meta, (counts.get(p.meta) ?? 0) + 1);
		});
		return [...counts.entries()].sort((a, b) => b[1] - a[1]);
	}, [people]);

	const [roleFilter, setRoleFilter] = useState<string | null>(null);

	const grouped = useMemo(() => {
		const shown = roleFilter ? people.filter(p => p.meta === roleFilter) : people;
		const m = new Map<string, Entity[]>();
		shown.forEach(p => {
			const r = p.meta || 'Other';
			if (!m.has(r)) m.set(r, []);
			m.get(r)!.push(p);
		});
		return [...m.entries()]
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([role, list]) => [
				role,
				[...list].sort((a, b) => Number(isStarred(b.id)) - Number(isStarred(a.id))),
			] as [string, Entity[]]);
	}, [people, roleFilter, starred]);

	if (people.length === 0) {
		return (
			<div className='empty-state'>
				<div className='empty-state__icon'>No people yet.</div>
				<h2 className='empty-state__title'>No people yet</h2>
				<p>Import your CSV files to see the roster.</p>
				<button className='btn-primary' onClick={() => navigate('/import')}>Import data
				</button>
			</div>
		);
	}

	return (
		<div>
			<div className='section-intro'>
				<h1 className='section-intro__title'>
					<Users size={26} />
					People
				</h1>
			</div>

			<div className='role-filters'>
				<button
					className={`role-filter-btn${roleFilter === null ? ' active' : ''}`}
					onClick={() => setRoleFilter(null)}
				>
					ALL · {String(people.length).padStart(2, '0')}
				</button>
				{allRoles.map(([role, count]) => (
					<button
						key={role}
						className={`role-filter-btn${roleFilter === role ? ' active' : ''}`}
						onClick={() => setRoleFilter(roleFilter === role ? null : role)}
					>
						{role.toUpperCase()} · {String(count).padStart(2, '0')}
					</button>
				))}
			</div>

			<div>
				{grouped.map(([role, list]) => (
					<div key={role} className='role-group block'>
						<div className='role-group__header block__heading'>
							<span>{role}</span>
							<span className='role-group__meta'>
                				{String(list.length).padStart(2, '0')}
              				</span>
						</div>
						<ul className='tile-grid--auto'>
							{list.map(p => (
								<PersonItem key={p.id} person={p} />
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}
