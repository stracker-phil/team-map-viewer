import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Boxes, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';
import { filterClaims } from '../utils/derive';
import { LinksSidebar } from '../components/LinksSidebar';
import { PersonItem } from '../components/PersonItem';
import { ProjectItem } from '../components/ProjectItem';
import { RepoItem } from '../components/RepoItem';
import { StarButton } from '../components/StarButton';
import { Entity, Claim } from '../types';

export function SquadDetail() {
	const { id } = useParams<{ id: string }>();
	const { claims, entityMap: map, teamSize } = useData();
	const { starred, isStarred } = useStar();
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
				items: items.sort((a, b) =>
					Number(isStarred(b.person.id)) - Number(isStarred(a.person.id)) ||
					a.person.name.localeCompare(b.person.name),
				),
			}));
	}, [memberClaims, map, starred]);

	const ownedProjects = useMemo(
		() => ownedClaims
			.map(c => ({ project: map.get(c.subject), claim: c }))
			.filter((x): x is {
				project: Entity;
				claim: Claim
			} => !!x.project && x.project.type === 'project' && (teamSize.get(x.project.id) ?? 0) > 0)
			.sort((a, b) =>
				Number(isStarred(b.project.id)) - Number(isStarred(a.project.id)) ||
				a.project.name.localeCompare(b.project.name),
			),
		[ownedClaims, map, teamSize, starred],
	);

	const ownedRepos = useMemo(() => {
		const seen = new Set<string>();
		const result: { repo: Entity; claim: Claim }[] = [];

		// direct: repo owned-by squad
		for (const c of ownedClaims) {
			const repo = map.get(c.subject);
			if (repo?.type === 'repo' && !seen.has(repo.id)) {
				seen.add(repo.id);
				result.push({ repo, claim: c });
			}
		}

		// indirect: repo belongs-to project owned-by squad
		const ownedProjectIds = new Set(ownedProjects.map(x => x.project.id));
		const belongsClaims = filterClaims(claims, { relation: 'belongs-to' });
		for (const c of belongsClaims) {
			if (!ownedProjectIds.has(c.object)) continue;
			const repo = map.get(c.subject);
			if (repo?.type === 'repo' && !seen.has(repo.id)) {
				seen.add(repo.id);
				result.push({ repo, claim: c });
			}
		}

		return result.sort((a, b) =>
			Number(isStarred(b.repo.id)) - Number(isStarred(a.repo.id)) ||
			a.repo.name.localeCompare(b.repo.name),
		);
	}, [ownedClaims, ownedProjects, claims, map, starred]);

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

					<div>
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

						{ownedRepos.length > 0 && (
							<div className='dl-section' style={{ marginTop: '1rem' }}>
								<div className='dl-section__heading'>
									Repos · {String(ownedRepos.length).padStart(2, '0')}
								</div>
								<ul className='entity-list'>
									{ownedRepos.map(({ repo, claim }) => (
										<RepoItem key={repo.id} repo={repo} claim={claim} />
									))}
								</ul>
							</div>
						)}
					</div>

					<LinksSidebar claims={claims} entityId={squad.id} />
				</div>
			</div>
		</div>
	);
}
