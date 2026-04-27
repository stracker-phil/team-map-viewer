import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Boxes, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';
import { filterClaims } from '../utils/derive';
import { LinksSidebar } from '../components/LinksSidebar';
import { PersonItem } from '../components/PersonItem';
import { ProjectItem } from '../components/ProjectItem';
import { StarButton } from '../components/StarButton';
import { Entity, Claim } from '../types';

export function SquadDetail() {
	const { id } = useParams<{ id: string }>();
	const { claims, entityMap: map, teamSize } = useData();
	const navigate = useNavigate();
	const squad = id ? map.get(id) : undefined;

	const memberClaims = useMemo(
		() => squad ? filterClaims(claims, { relation: 'member-of', object: squad.id }) : [],
		[claims, squad],
	);
	const ownedClaims = useMemo(
		() => squad ? filterClaims(claims, { relation: 'owned-by', object: squad.id }) : [],
		[claims, squad],
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
			.filter((x): x is {
				project: Entity;
				claim: Claim
			} => !!x.project && (teamSize.get(x.project.id) ?? 0) > 0)
			.sort((a, b) => a.project.name.localeCompare(b.project.name)),
		[ownedClaims, map, teamSize],
	);

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
				<div className='entity-header'>
					<span className='entity-header__icon'><Boxes size={24} /></span>
					<div style={{ flex: 1 }}>
						<h1 className='entity-header__title'>{squad.name}</h1>
						{squad.meta && (
							<div className='entity-header__meta'>{squad.meta}</div>
						)}
					</div>
					<StarButton entityId={squad.id} size='lg' />
				</div>

				<div className='squad-detail-layout'>
					<div className='dl-section'>
						<div className='dl-section__heading'>
							People · {String(memberClaims.length).padStart(2, '0')}
						</div>
						{membersByRole.length === 0 ? (
							<p className='dl-table__empty'>No members recorded yet.</p>
						) : (
							membersByRole.map(({ role, items }) => (
								<div key={role} className='squad-role-group'>
									<div className='squad-card__section-label'>{role}</div>
									<ul className='entity-list'>
										{items.map(({ person, claim }) => (
											<PersonItem
												key={person.id} person={person} claim={claim}
											/>
										))}
									</ul>
								</div>
							))
						)}
					</div>

					<div className='dl-section'>
						<div className='dl-section__heading'>
							Projects · {String(ownedProjects.length).padStart(2, '0')}
						</div>
						{ownedProjects.length === 0 ? (
							<p className='dl-table__empty'>No owned projects recorded yet.</p>
						) : (
							<ul className='entity-list'>
								{ownedProjects.map(({ project, claim }) => (
									<ProjectItem key={project.id} project={project} claim={claim} />
								))}
							</ul>
						)}
					</div>

					<LinksSidebar claims={claims} entityId={squad.id} />
				</div>
			</div>
		</div>
	);
}
