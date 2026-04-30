import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';
import { SquadCard } from '../components/SquadCard';

export function TeamOverview() {
	const { squads, config } = useData();
	const { starred, isStarred } = useStar();
	const navigate = useNavigate();

	const sorted = useMemo(
		() => [...squads].sort((a, b) => Number(isStarred(b.id)) - Number(isStarred(a.id))),
		[squads, starred],
	);

	if (squads.length === 0) {
		return (
			<div className='empty-state'>
				<div className='empty-state__icon'>No squads yet.</div>
				<h2 className='empty-state__title'>No teams yet</h2>
				<p>Import your CSV files to see the team map.</p>
				<button className='btn-primary' onClick={() => navigate('/import')}>Import data
				</button>
			</div>
		);
	}

	return (
		<div>
			<div className='section-intro'>
				<h1 className='section-intro__title'>
					<Boxes size={26} />
					Squads
				</h1>
				{config?.pages?.squads?.description && (
					<p className='section-intro__description'>{config.pages.squads.description}</p>
				)}
			</div>
			<div className='tile-grid'>
				{sorted.map(squad => (
					<SquadCard key={squad.id} squad={squad} />
				))}
			</div>
		</div>
	);
}
