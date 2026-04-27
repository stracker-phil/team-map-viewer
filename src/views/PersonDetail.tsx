import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Avatar } from '../components/Avatar';
import { LinksSidebar } from '../components/LinksSidebar';
import { PersonDetailMain } from '../components/PersonDetailMain';
import { StarButton } from '../components/StarButton';

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
				<div className='page-header'>
					<div className='page-header__avatar'>
						<Avatar name={person.name} id={person.id} size='lg' />
					</div>
					<div className='page-header__body'>
						<h1 className='page-header__title'>{person.name}</h1>
						{(roleMap.get(person.id) || person.meta) && (
							<div className='page-header__meta'>
								{roleMap.get(person.id) || person.meta}
							</div>
						)}
					</div>
					<div className='page-header__actions'>
						<StarButton entityId={person.id} size='lg' />
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
