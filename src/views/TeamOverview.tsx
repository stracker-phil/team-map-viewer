import { useNavigate } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { useData } from '../context/DataContext';
import { SquadCard } from '../components/SquadCard';

export function TeamOverview() {
	const { squads } = useData();
	const navigate = useNavigate();

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
			</div>
			<div className='squad-grid'>
				{squads.map(squad => (
					<SquadCard key={squad.id} squad={squad} />
				))}
			</div>
		</div>
	);
}
