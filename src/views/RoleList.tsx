import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';
import { PersonItem } from '../components/PersonItem';
import { ListSearch } from '../components/ListSearch';
import { FilterChips, FilterChipItem } from '../components/FilterChips';
import { Entity } from '../types';

export function RoleList() {
	const { people, config } = useData();
	const { starred, isStarred } = useStar();
	const navigate = useNavigate();

	const [roleFilter, setRoleFilter] = useState<string | null>(null);
	const [textFilter, setTextFilter] = useState('');

	const roleChips = useMemo<FilterChipItem[]>(() => {
		const counts = new Map<string, number>();
		people.forEach(p => {
			if (!p.meta) return;
			counts.set(p.meta, (counts.get(p.meta) ?? 0) + 1);
		});
		return [...counts.entries()]
			.sort((a, b) => b[1] - a[1])
			.map(([role, count]) => ({ value: role, label: role.toUpperCase(), count }));
	}, [people]);

	const grouped = useMemo(() => {
		let shown = roleFilter ? people.filter(p => p.meta === roleFilter) : people;
		if (textFilter.trim()) {
			const q = textFilter.trim().toLowerCase();
			shown = shown.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
		}
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
	}, [people, roleFilter, textFilter, starred]);

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
		<div className='list type-person'>
			<div className='section-intro'>
				<h1 className='section-intro__title'>
					<Users size={26} />
					People
				</h1>
				{config?.pages?.people?.description && (
					<p className='section-intro__description'>{config.pages.people.description}</p>
				)}
			</div>

			<ListSearch value={textFilter} onChange={setTextFilter} />
			<FilterChips
				items={roleChips}
				active={roleFilter}
				onChange={setRoleFilter}
				allCount={people.length}
			/>

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
