import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { RepoItem } from '../components/RepoItem.tsx';
import { ListSearch } from '../components/ListSearch';
import { FilterChips, FilterChipItem } from '../components/FilterChips';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';

export function ReposList() {
	const { repos, contributorCount, repoDepsMap, config } = useData();
	const { starred, isStarred } = useStar();
	const navigate = useNavigate();

	const [phpFilter, setPhpFilter] = useState<string | null>(null);
	const [textFilter, setTextFilter] = useState('');

	const phpVersionMap = useMemo(() => {
		const m = new Map<string, string>();
		repos.forEach(r => {
			const dep = repoDepsMap.get(r.id)?.find(d => d.entity === null && /^php\d/i.test(d.label));
			if (dep) m.set(r.id, dep.label.replace(/^php/i, ''));
		});
		return m;
	}, [repos, repoDepsMap]);

	const phpChips = useMemo<FilterChipItem[]>(() => {
		const counts = new Map<string, number>();
		phpVersionMap.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1));
		const items = [...counts.entries()]
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([v, count]) => ({ value: v, label: `PHP ${v}`, count }));
		const noPhpCount = repos.length - phpVersionMap.size;
		if (noPhpCount > 0) items.push({ value: '__none__', label: 'NO PHP', count: noPhpCount });
		return items;
	}, [repos, phpVersionMap]);

	const filtered = useMemo(() => {
		let list = repos;
		if (phpFilter === '__none__') list = list.filter(r => !phpVersionMap.has(r.id));
		else if (phpFilter) list = list.filter(r => phpVersionMap.get(r.id) === phpFilter);
		if (textFilter.trim()) {
			const q = textFilter.trim().toLowerCase();
			list = list.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
		}
		return [...list].sort((a, b) => Number(isStarred(b.id)) - Number(isStarred(a.id)));
	}, [repos, phpFilter, textFilter, phpVersionMap, starred]);

	if (repos.length === 0) {
		return (
			<div className='empty-state'>
				<div className='empty-state__icon'>No repos yet.</div>
				<h2 className='empty-state__title'>No repos yet</h2>
				<p>Import your CSV files to see the repository list.</p>
				<button className='btn-primary' onClick={() => navigate('/import')}>Import data
				</button>
			</div>
		);
	}

	return (
		<div>
			<div className='section-intro'>
				<h1 className='section-intro__title'>
					<GitBranch size={26} />
					Repos
				</h1>
				{config?.pages?.repos?.description && (
					<p className='section-intro__description'>{config.pages.repos.description}</p>
				)}
			</div>

			<ListSearch value={textFilter} onChange={setTextFilter} />
			<FilterChips
				items={phpChips}
				active={phpFilter}
				onChange={setPhpFilter}
				allLabel='ALL PHP'
				allCount={phpVersionMap.size}
			/>

			<table className='entity-table'>
				<thead>
				<tr>
					<th>Name</th>
					<th>PHP</th>
					<th>Contributors</th>
				</tr>
				</thead>
				<tbody>
				{filtered.map(r => (
					<tr key={r.id} onClick={() => navigate(`/repo/${r.id}`)}>
						<td className='entity-table__name'>
							<RepoItem key={r.id} repo={r} />
						</td>
						<td className='entity-table__mono'>{phpVersionMap.get(r.id) ?? ''}</td>
						<td className='entity-table__mono'>{contributorCount.get(r.id) ?? 0}</td>
					</tr>
				))}
				</tbody>
			</table>
		</div>
	);
}
