import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { LinksSidebar } from '../components/LinksSidebar';
import { RepoDetailMain } from '../components/RepoDetailMain';

export function RepoDetail() {
	const { id } = useParams<{ id: string }>();
	const { claims, entityMap: map } = useData();
	const navigate = useNavigate();
	const repo = id ? map.get(id) : undefined;

	if (!repo || repo.type !== 'repo') {
		return (
			<div className='empty-state'>
				<div className='empty-state__icon'>Not found.</div>
				<h2 className='empty-state__title'>Repo not found</h2>
				<p>ID: {id}</p>
				<button className='btn-outline' onClick={() => navigate('/')}>Back to overview
				</button>
			</div>
		);
	}

	return (
		<div>
			<button className='back-link' onClick={() => navigate(-1)}>
				<ArrowLeft size={13} />
				BACK
			</button>

			<div style={{ marginTop: '1.5rem' }}>
				<div className='entity-header'>
					<span className='entity-header__icon'><GitBranch size={24} /></span>
					<div style={{ flex: 1 }}>
						<h1 className='entity-header__title'>{repo.name}</h1>
						{repo.meta && (
							<div className='entity-header__meta'>{repo.meta}</div>
						)}
					</div>
				</div>

				<div className='detail-layout'>
					<RepoDetailMain repoId={repo.id} />
					<LinksSidebar claims={claims} entityId={repo.id} entity={repo} />
				</div>
			</div>
		</div>
	);
}
