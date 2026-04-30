import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2 } from 'lucide-react';
import { ProjectItem } from '../components/ProjectItem.tsx';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';

export function ProjectsList() {
	const { projects, teamSize, squadOf, entityMap, config } = useData();
	const { starred, isStarred } = useStar();
	const navigate = useNavigate();

	const [ownerFilter, setOwnerFilter] = useState<string | null>(null);

	// Only show projects that have at least one team member
	const activeProjects = useMemo(
		() => projects.filter(p => (teamSize.get(p.id) ?? 0) > 0),
		[projects, teamSize],
	);

	const allOwners = useMemo(() => {
		const counts = new Map<string, number>();
		activeProjects.forEach(p => {
			const ownerId = squadOf.get(p.id);
			if (!ownerId) return;
			counts.set(ownerId, (counts.get(ownerId) ?? 0) + 1);
		});
		return [...counts.entries()]
			.map(([id, count]) => ({ squad: entityMap.get(id), count }))
			.filter((x): x is {
				squad: NonNullable<ReturnType<typeof entityMap.get>>;
				count: number
			} => !!x.squad)
			.sort((a, b) => b.count - a.count);
	}, [activeProjects, squadOf, entityMap]);

	const unownedCount = useMemo(
		() => activeProjects.filter(p => !squadOf.has(p.id)).length,
		[activeProjects, squadOf],
	);

	const filtered = useMemo(() => {
		let list = activeProjects;
		if (ownerFilter === '__none__') list = activeProjects.filter(p => !squadOf.has(p.id));
		else if (ownerFilter) list = activeProjects.filter(p => squadOf.get(p.id) === ownerFilter);
		return [...list].sort((a, b) => Number(isStarred(b.id)) - Number(isStarred(a.id)));
	}, [activeProjects, ownerFilter, squadOf, starred]);

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

			{allOwners.length > 0 && (
				<div className='role-filters'>
					<button
						className={`role-filter-btn${ownerFilter === null ? ' active' : ''}`}
						onClick={() => setOwnerFilter(null)}
					>
						ALL · {String(activeProjects.length).padStart(2, '0')}
					</button>
					{allOwners.map(({ squad, count }) => (
						<button
							key={squad.id}
							className={`role-filter-btn${ownerFilter === squad.id ? ' active' : ''}`}
							onClick={() => setOwnerFilter(ownerFilter === squad.id ? null : squad.id)}
						>
							{squad.name.toUpperCase()} · {String(count).padStart(2, '0')}
						</button>
					))}
					{unownedCount > 0 && (
						<button
							className={`role-filter-btn${ownerFilter === '__none__' ? ' active' : ''}`}
							onClick={() => setOwnerFilter(ownerFilter === '__none__' ? null : '__none__')}
						>
							OTHER · {String(unownedCount).padStart(2, '0')}
						</button>
					)}
				</div>
			)}

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
