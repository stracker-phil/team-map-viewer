import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderGit2, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { LinksSidebar } from '../components/LinksSidebar';
import { ListSearch } from '../components/ListSearch';
import { ProjectDetailMain } from '../components/ProjectDetailMain';
import { StarButton } from '../components/StarButton';

export function ProjectDetail() {
	const { id } = useParams<{ id: string }>();
	const { claims, entityMap: map } = useData();
	const navigate = useNavigate();
	const [filterQuery, setFilterQuery] = useState('');
	const project = id ? map.get(id) : undefined;

	if (!project || project.type !== 'project') {
		return (
			<div className='empty-state'>
				<div className='empty-state__icon'>Not found.</div>
				<h2 className='empty-state__title'>Project not found</h2>
				<p>ID: {id}</p>
				<button className='btn-outline' onClick={() => navigate('/')}>Back to overview
				</button>
			</div>
		);
	}

	return (
		<div className='entity type-project'>
			<button className='back-link' onClick={() => navigate(-1)}>
				<ArrowLeft size={13} />
				BACK
			</button>

			<div style={{ marginTop: '1.5rem' }}>
				<div className='page-header'>
					<span className='page-header__icon'><FolderGit2 size={24} /></span>
					<div className='page-header__body'>
						<h1 className='page-header__title'>{project.name}</h1>
						{project.meta && (
							<div className='page-header__meta'>Client: {project.meta}</div>
						)}
					</div>
					<div className='page-header__actions'>
						<StarButton entityId={project.id} size='lg' />
					</div>
				</div>

				<ListSearch value={filterQuery} onChange={setFilterQuery} />
				<div className='detail-layout'>
					<ProjectDetailMain projectId={project.id} filterQuery={filterQuery} />
					<LinksSidebar claims={claims} entityId={project.id} />
				</div>
			</div>
		</div>
	);
}
