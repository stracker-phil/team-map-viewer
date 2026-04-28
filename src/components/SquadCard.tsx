import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { useData } from '../context/DataContext';
import { filterClaims } from '../utils/derive';
import { EntityPopup } from './EntityPopup';
import { SquadDetailMain } from './SquadDetailMain';
import { StarIndicator } from './StarIndicator';
import { Entity } from '../types';

interface Props {
	squad: Entity;
}

export function SquadCard({ squad }: Props) {
	const navigate = useNavigate();
	const { claims, teamSize } = useData();

	const memberCount = useMemo(
		() => filterClaims(claims, { relation: 'member-of', object: squad.id }).length,
		[claims, squad.id],
	);

	const projectCount = useMemo(
		() => filterClaims(claims, { relation: 'owned-by', object: squad.id })
			.filter(c => (teamSize.get(c.subject) ?? 0) > 0).length,
		[claims, squad.id, teamSize],
	);

	const metaItems = useMemo(() => {
		const items = [];
		items.push(<span key='members'>{memberCount} People</span>);
		if (projectCount) {
			items.push(<span key='projects'>{projectCount} Projects</span>);
		}
		return items;
	}, [memberCount, projectCount]);

	return (
		<EntityPopup
			as='button'
			className='squad-card'
			onClick={() => navigate(`/squad/${squad.id}`)}
			entity={squad}
			meta={squad.meta}
			popup={<SquadDetailMain squadId={squad.id} compact />}
		>
			<div className='squad-card__header'>
				<div>
					{squad.meta && (
						<div className='squad-card__meta-label'>{squad.meta}</div>
					)}
					<div className='squad-card__name'>
						<StarIndicator entityId={squad.id} />
						{squad.name}
					</div>
				</div>
				<span className='squad-card__icon'><Boxes size={20} /></span>
			</div>
			<div className='squad-card__stats'>
				{metaItems.reduce((acc, item, i) => {
					if (i === 0) return [item];

					return [
						...acc,
						<span key={`sep-${i}`} className='squad-card__stats-sep'>·</span>,
						item,
					];
				}, [] as React.ReactElement[])}
			</div>

		</EntityPopup>
	);
}
