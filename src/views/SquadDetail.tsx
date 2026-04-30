import { useParams, useNavigate } from 'react-router-dom';
import { Boxes, ArrowLeft } from 'lucide-react';
import { SquadDetailMain } from '../components/SquadDetailMain.tsx';
import { useData } from '../context/DataContext';
import { LinksSidebar } from '../components/LinksSidebar';
import { StarButton } from '../components/StarButton';

export function SquadDetail() {
	const { id } = useParams<{ id: string }>();
	const { claims, entityMap: map, teamSize } = useData();
	const navigate = useNavigate();
	const squad = id ? map.get(id) : undefined;

	if (!squad || squad.type !== 'squad') {
		return (
			<div className='empty-state'>
				<div className='empty-state__icon'>Not found.</div>
				<h2 className='empty-state__title'>Team not found</h2>
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
					<span className='page-header__icon'><Boxes size={24} /></span>
					<div className='page-header__body'>
						<h1 className='page-header__title'>{squad.name}</h1>
						{squad.meta && (
							<div className='page-header__meta'>{squad.meta}</div>
						)}
					</div>
					<div className='page-header__actions'>
						<StarButton entityId={squad.id} size='lg' />
					</div>
				</div>

				<div className='detail-layout'>
					<SquadDetailMain squadId={squad.id} />
					<LinksSidebar claims={claims} entityId={squad.id} />
				</div>
			</div>
		</div>
	);
}
