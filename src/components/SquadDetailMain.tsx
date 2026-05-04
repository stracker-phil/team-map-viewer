import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';
import { filterClaims } from '../utils/derive';
import { PersonItem } from './PersonItem';
import { ProjectItem } from './ProjectItem';
import { RepoItem } from './RepoItem';
import { Entity, Claim } from '../types';

interface Props {
	squadId: string;
	compact?: boolean;
	filterQuery?: string;
}

export function SquadDetailMain({ squadId, compact, filterQuery }: Props) {
	const { starred, isStarred } = useStar();
	const { claims, entityMap: map } = useData();
	const squad = map.get(squadId);

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
			} => !!x.project && x.project.type === 'project')
			.sort((a, b) =>
				Number(isStarred(b.project.id)) - Number(isStarred(a.project.id)) ||
				a.project.name.localeCompare(b.project.name),
			),
		[ownedClaims, map, starred],
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

	const q = filterQuery?.trim().toLowerCase() ?? '';
	const filteredMembersByRole = q
		? membersByRole
			.map(({ role, items }) => ({ role, items: items.filter(x => x.person.name.toLowerCase().includes(q)) }))
			.filter(({ items }) => items.length > 0)
		: membersByRole;
	const filteredOwnedProjects = q ? ownedProjects.filter(x => x.project.name.toLowerCase().includes(q)) : ownedProjects;
	const filteredOwnedRepos = q ? ownedRepos.filter(x => x.repo.name.toLowerCase().includes(q)) : ownedRepos;

	if (compact) {
		return (
			<div className='popup__body'>
				<div className='popup__col'>
					{membersByRole.length > 0 && (
						<div className='block'>
							<div className='block__heading'>
								People · {String(memberClaims.length).padStart(2, '0')}
							</div>
							{membersByRole.map(({ role, items }) => (
								<div key={role} className='squad-role-group'>
									<div className='pdm-people__key'>{role}</div>
									<ul className='entity-list'>
										{items.map(({ person, claim }) => (
											<PersonItem
												key={person.id} person={person} claim={claim}
											/>
										))}
									</ul>
								</div>
							))}
						</div>
					)}
					{ownedProjects.length > 0 && (
						<div className='block'>
							<div className='block__heading'>
								Projects · {String(ownedProjects.length).padStart(2, '0')}
							</div>
							<ul className='entity-list'>
								{ownedProjects.map(({ project, claim }) => (
									<ProjectItem
										key={project.id} project={project} claim={claim}
									/>
								))}
							</ul>
						</div>
					)}
					{membersByRole.length === 0 && ownedProjects.length === 0 && (
						<p className='block__empty'>No assignments recorded yet.</p>
					)}
				</div>
			</div>
		);
	}

	return <div className='detail-main'>
		<div className='cols-2'>
			<div className='block'>
				<div className='block__heading'>
					People · {String(memberClaims.length).padStart(2, '0')}
				</div>
				{filteredMembersByRole.length === 0 ? (
					<p className='block__empty'>{membersByRole.length === 0 ? 'No members recorded yet.' : 'No matches.'}</p>
				) : (
					filteredMembersByRole.map(({ role, items }) => (
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

			<div className='stack'>
				<div className='block'>
					<div className='block__heading'>
						Projects · {String(ownedProjects.length).padStart(2, '0')}
					</div>
					{filteredOwnedProjects.length === 0 ? (
						<p className='block__empty'>{ownedProjects.length === 0 ? 'No owned projects recorded yet.' : 'No matches.'}</p>
					) : (
						<ul className='entity-list'>
							{filteredOwnedProjects.map(({ project, claim }) => (
								<ProjectItem key={project.id} project={project} claim={claim} />
							))}
						</ul>
					)}
				</div>

				{(filteredOwnedRepos.length > 0 || (q && ownedRepos.length > 0)) && (
					<div className='block'>
						<div className='block__heading'>
							Repos · {String(ownedRepos.length).padStart(2, '0')}
						</div>
						{filteredOwnedRepos.length === 0 ? (
							<p className='block__empty'>No matches.</p>
						) : (
							<ul className='entity-list'>
								{filteredOwnedRepos.map(({ repo, claim }) => (
									<RepoItem key={repo.id} repo={repo} claim={claim} />
								))}
							</ul>
						)}
					</div>
				)}
			</div>
		</div>
	</div>;
}
