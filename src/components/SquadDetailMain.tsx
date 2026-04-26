import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { useData } from '../context/DataContext';
import { filterClaims } from '../utils/derive';
import { PersonItem } from './PersonItem';
import { ProjectItem } from './ProjectItem';
import { Entity, Claim } from '../types';

interface Props {
	squadId: string;
	compact?: boolean;
}

export function SquadDetailMain({ squadId, compact }: Props) {
	const { claims, entityMap: map, teamSize } = useData();

	const memberClaims = useMemo(
		() => filterClaims(claims, { relation: 'member-of', object: squadId }),
		[claims, squadId],
	);
	const ownedClaims = useMemo(
		() => filterClaims(claims, { relation: 'owned-by', object: squadId }),
		[claims, squadId],
	);

	const membersByRole = useMemo(() => {
		const groups = new Map<string, { person: Entity; claim: Claim }[]>();
		for (const c of memberClaims) {
			const person = map.get(c.subject);
			if (!person) continue;
			const role = person.meta || 'Other';
			if (!groups.has(role)) groups.set(role, []);
			groups.get(role)!.push({ person, claim: c });
		}
		return [...groups.entries()]
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([role, items]) => ({
				role,
				items: items.sort((a, b) => a.person.name.localeCompare(b.person.name)),
			}));
	}, [memberClaims, map]);

	const ownedProjects = useMemo(
		() => ownedClaims
			.map(c => ({ project: map.get(c.subject), claim: c }))
			.filter((x): x is { project: Entity; claim: Claim } =>
				!!x.project && (teamSize.get(x.project.id) ?? 0) > 0)
			.sort((a, b) => a.project.name.localeCompare(b.project.name)),
		[ownedClaims, map, teamSize],
	);

	const squad = map.get(squadId);

	if (!compact) return null;

	return (
		<div className='squad-popup'>
			<Link to={`/squad/${squadId}`} className='squad-popup__title'>
				<span className='squad-popup__icon'><Boxes size={16} /></span>
				<span className='font-display squad-popup__name'>{squad?.name ?? squadId}</span>
				{squad?.meta && <span className='squad-popup__meta'>{squad.meta}</span>}
			</Link>
			<div className='squad-popup__body'>
				<div className='squad-popup__col'>
					{membersByRole.length > 0 && (
						<div className='pdm-section'>
							<div className='pdm-section__heading'>
								People · {String(memberClaims.length).padStart(2, '0')}
							</div>
							{membersByRole.map(({ role, items }) => (
								<div key={role} className='squad-role-group'>
									<div className='pdm-people__key'>{role}</div>
									<ul className='entity-list'>
										{items.map(({ person, claim }) => (
											<PersonItem key={person.id} person={person} claim={claim} />
										))}
									</ul>
								</div>
							))}
						</div>
					)}
					{ownedProjects.length > 0 && (
						<div className='pdm-section'>
							<div className='pdm-section__heading'>
								Projects · {String(ownedProjects.length).padStart(2, '0')}
							</div>
							<ul className='entity-list'>
								{ownedProjects.map(({ project, claim }) => (
									<ProjectItem key={project.id} project={project} claim={claim} />
								))}
							</ul>
						</div>
					)}
					{membersByRole.length === 0 && ownedProjects.length === 0 && (
						<p className='dl-table__empty'>No assignments recorded yet.</p>
					)}
				</div>
			</div>
		</div>
	);
}
