import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { LinksSidebar } from '../components/LinksSidebar';
import { ListSearch } from '../components/ListSearch';
import { RepoDetailMain } from '../components/RepoDetailMain';
import { StarButton } from '../components/StarButton';

export function RepoDetail() {
	const { id } = useParams<{ id: string }>();
	const { claims, entityMap: map } = useData();
	const navigate = useNavigate();
	const [filterQuery, setFilterQuery] = useState('');
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
		<div className='entity type-repo'>
			<button className='back-link' onClick={() => navigate(-1)}>
				<ArrowLeft size={13} />
				BACK
			</button>

			<div style={{ marginTop: '1.5rem' }}>
				<div className='page-header'>
					<span className='page-header__icon'><GitBranch size={24} /></span>
					<div className='page-header__body'>
						<h1 className='page-header__title'>{repo.name}</h1>
						{repo.meta && (
							<div className='page-header__meta'>{repo.meta}</div>
						)}
					</div>
					<div className='page-header__actions'>
						<StarButton entityId={repo.id} size='lg' />
					</div>
				</div>

				<ListSearch value={filterQuery} onChange={setFilterQuery} />
				<div className='detail-layout'>
					<RepoDetailMain repoId={repo.id} filterQuery={filterQuery} />
					<LinksSidebar claims={claims} entityId={repo.id} entity={repo} />
				</div>
			</div>
		</div>
	);
}
