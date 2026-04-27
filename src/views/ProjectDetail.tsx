import { useParams, useNavigate } from 'react-router-dom';
import { FolderGit2, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { LinksSidebar } from '../components/LinksSidebar';
import { ProjectDetailMain } from '../components/ProjectDetailMain';
import { StarButton } from '../components/StarButton';

export function ProjectDetail() {
	const { id } = useParams<{ id: string }>();
	const { claims, entityMap: map } = useData();
	const navigate = useNavigate();
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
		<div>
			<button className='back-link' onClick={() => navigate(-1)}>
				<ArrowLeft size={13} />
				BACK
			</button>

			<div style={{ marginTop: '1.5rem' }}>
				<div className='entity-header'>
					<span className='entity-header__icon'><FolderGit2 size={24} /></span>
					<div style={{ flex: 1 }}>
						<h1 className='entity-header__title'>{project.name}</h1>
						{project.meta && (
							<div className='entity-header__meta'>Client: {project.meta}</div>
						)}
					</div>
					<StarButton entityId={project.id} size='lg' />
				</div>

				<div className='detail-layout'>
					<ProjectDetailMain projectId={project.id} />
					<LinksSidebar claims={claims} entityId={project.id} />
				</div>
			</div>
		</div>
	);
}
