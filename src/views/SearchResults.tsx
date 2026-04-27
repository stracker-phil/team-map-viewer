import { useSearchParams, useNavigate } from 'react-router-dom';
import { FolderGit2, GitBranch, Boxes, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { searchEntities } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { Avatar } from '../components/Avatar';
import { Entity } from '../types';

function TypeIcon({ entity }: { entity: Entity }) {
	if (entity.type === 'person') return <Avatar name={entity.name} id={entity.id} size='sm' />;
	if (entity.type === 'project') return <FolderGit2 size={16} />;
	if (entity.type === 'repo') return <GitBranch size={16} />;
	return <Boxes size={16} />;
}

export function SearchResults() {
	const [params] = useSearchParams();
	const query = params.get('q') ?? '';
	const { entities } = useData();
	const navigate = useNavigate();

	const results = searchEntities(entities, query);

	return (
		<div>
			<button className='back-link' onClick={() => navigate(-1)}>
				<ArrowLeft size={13} />
				BACK
			</button>

			<div style={{ marginTop: '1.5rem' }}>
				<div className='section-intro'>
					<div className='section-intro__eyebrow'>SEARCH</div>
					<h2 className='section-intro__title'>"{query}"</h2>
				</div>

				{results.length === 0 ? (
					<div className='empty-state'>
						<div className='empty-state__icon'>No matches.</div>
						<h2 className='empty-state__title'>Nothing found</h2>
						<p>Try searching by name, role, or project client.</p>
					</div>
				) : (
					<div className='search-results'>
						{results.map(entity => (
							<div key={entity.id} className='search-result-row'>
                <span className='search-result-row__icon'>
                  <TypeIcon entity={entity} />
                </span>
								<div className='search-result-row__info'>
									<div className='search-result-name'>
										<EntityLink entity={entity} />
									</div>
									{entity.meta && (
										<div className='search-result-meta'>{entity.meta}</div>
									)}
								</div>
								<span className='search-result-type'>{entity.type}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
