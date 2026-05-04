import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2 } from 'lucide-react';
import { ProjectItem } from '../components/ProjectItem.tsx';
import { ListSearch } from '../components/ListSearch';
import { FilterChips, FilterChipItem } from '../components/FilterChips';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';

export function ProjectsList() {
	const { projects, teamSize, squadOf, entityMap, config } = useData();
	const { starred, isStarred } = useStar();
	const navigate = useNavigate();

	const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
	const [textFilter, setTextFilter] = useState('');

	const activeProjects = useMemo(
		() => projects.filter(p => squadOf.has(p.id) || (teamSize.get(p.id) ?? 0) > 0),
		[projects, teamSize, squadOf],
	);

	const ownerChips = useMemo<FilterChipItem[]>(() => {
		const counts = new Map<string, number>();
		activeProjects.forEach(p => {
			const ownerId = squadOf.get(p.id);
			if (!ownerId) return;
			counts.set(ownerId, (counts.get(ownerId) ?? 0) + 1);
		});
		const items: FilterChipItem[] = [...counts.entries()]
			.map(([id, count]) => ({ squad: entityMap.get(id), count, id }))
			.filter((x): x is { squad: NonNullable<ReturnType<typeof entityMap.get>>; count: number; id: string } => !!x.squad)
			.sort((a, b) => b.count - a.count)
			.map(({ squad, count }) => ({ value: squad.id, label: squad.name.toUpperCase(), count }));
		const unowned = activeProjects.filter(p => !squadOf.has(p.id)).length;
		if (unowned > 0) items.push({ value: '__none__', label: 'OTHER', count: unowned });
		return items;
	}, [activeProjects, squadOf, entityMap]);

	const filtered = useMemo(() => {
		let list = activeProjects;
		if (ownerFilter === '__none__') list = list.filter(p => !squadOf.has(p.id));
		else if (ownerFilter) list = list.filter(p => squadOf.get(p.id) === ownerFilter);
		if (textFilter.trim()) {
			const q = textFilter.trim().toLowerCase();
			list = list.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
		}
		return [...list].sort((a, b) => Number(isStarred(b.id)) - Number(isStarred(a.id)));
	}, [activeProjects, ownerFilter, textFilter, squadOf, starred]);

	if (activeProjects.length === 0) {
		return (
			<div className='empty-state'>
				<div className='empty-state__icon'>No projects yet.</div>
				<h2 className='empty-state__title'>No projects yet</h2>
				<p>Import your CSV files to see the project portfolio.</p>
				<button className='btn-primary' onClick={() => navigate('/import')}>Import data
				</button>
			</div>
		);
	}

	return (
		<div>
			<div className='section-intro'>
				<h1 className='section-intro__title'>
					<FolderGit2 size={26} />
					Projects
				</h1>
				{config?.pages?.projects?.description && (
					<p className='section-intro__description'>{config.pages.projects.description}</p>
				)}
			</div>

			<ListSearch value={textFilter} onChange={setTextFilter} />
			<FilterChips
				items={ownerChips}
				active={ownerFilter}
				onChange={setOwnerFilter}
				allCount={activeProjects.length}
			/>

			<table className='entity-table'>
				<thead>
				<tr>
					<th>Name</th>
					<th>Team size</th>
					<th>Owner</th>
				</tr>
				</thead>
				<tbody>
				{filtered.map(p => {
					const ownerId = squadOf.get(p.id);
					const ownerEntity = ownerId ? entityMap.get(ownerId) : undefined;
					return (
						<tr key={p.id} onClick={() => navigate(`/project/${p.id}`)}>
							<td className='entity-table__name'>
								<ProjectItem key={p.id} project={p} />
							</td>
							<td className='entity-table__mono'>{teamSize.get(p.id) ?? 0}</td>
							<td className='entity-table__mono'>{ownerEntity?.name ?? '—'}</td>
						</tr>
					);
				})}
				</tbody>
			</table>
		</div>
	);
}
