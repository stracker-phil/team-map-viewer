import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Avatar } from '../components/Avatar';
import { LinksSidebar } from '../components/LinksSidebar';
import { PersonDetailMain } from '../components/PersonDetailMain';

export function PersonDetail() {
	const { id } = useParams<{ id: string }>();
	const { claims, entityMap: map, personRoleMap: roleMap } = useData();
	const navigate = useNavigate();
	const person = id ? map.get(id) : undefined;

	if (!person || person.type !== 'person') {
		return (
			<div className='empty-state'>
				<div className='empty-state__icon'>Not found.</div>
				<h2 className='empty-state__title'>Person not found</h2>
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
				<div className='entity-header entity-header--person'>
					<Avatar name={person.name} id={person.id} size='lg' />
					<div style={{ flex: 1 }}>
						<h1 className='entity-header__title'>{person.name}</h1>
						{(roleMap.get(person.id) || person.meta) && (
							<div className='entity-header__meta'>
								{roleMap.get(person.id) || person.meta}
							</div>
						)}
					</div>
				</div>

				<div className='detail-layout'>
					<PersonDetailMain personId={person.id} />
					<LinksSidebar claims={claims} entityId={person.id} />
				</div>
			</div>
		</div>
	);
}
