import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { RepoItem } from '../components/RepoItem.tsx';
import { useData } from '../context/DataContext';

export function ReposList() {
	const { repos, contributorCount } = useData();
	const navigate = useNavigate();

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
			</div>

			<table className='entity-table'>
				<thead>
				<tr>
					<th>Name</th>
					<th>Contributors</th>
				</tr>
				</thead>
				<tbody>
				{repos.map(r => (
					<tr key={r.id} onClick={() => navigate(`/repo/${r.id}`)}>
						<td className='entity-table__name'>
							<RepoItem key={r.id} repo={r} />
						</td>
						<td className='entity-table__mono'>{contributorCount.get(r.id) ?? 0}</td>
					</tr>
				))}
				</tbody>
			</table>
		</div>
	);
}
