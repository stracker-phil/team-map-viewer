import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';
import { filterClaims } from '../utils/derive';
import { PersonItem } from './PersonItem';
import { ProjectItem } from './ProjectItem';
import { RepoItem } from './RepoItem';
import { Entity, Claim } from '../types';

interface Props {
	repoId: string;
	compact?: boolean;
	filterQuery?: string;
}

interface ContributorsBlockProps {
	contributors: { person: Entity; claim: Claim }[];
}

function ProjectsBlock({ projects }: { projects: { project: Entity; claim: Claim }[] }) {
	if (!projects.length) return null;
	return (
		<div className='block'>
			<div className='block__heading'>Projects</div>
			<ul className='entity-list'>
				{projects.map(({ project, claim }) => (
					<ProjectItem
						key={project.id} project={project} claim={claim} detail={claim.detail}
					/>
				))}
			</ul>
		</div>
	);
}

function DependenciesBlock({ deps }: { deps: { entity: Entity | null; label: string }[] }) {
	if (!deps.length) return null;
	return (
		<div className='block'>
			<div className='block__heading'>Dependencies</div>
			<ul className='entity-list'>
				{deps.map(({ entity, label }) =>
					entity?.type === 'repo' ? (
						<RepoItem key={entity.id} repo={entity} />
					) : (
						<li key={label} className='entity-item'>
							<code className='font-mono'>{label}</code>
						</li>
					),
				)}
			</ul>
		</div>
	);
}

function UsagesBlock({ usages }: { usages: Entity[] }) {
	if (!usages.length) return null;
	return (
		<div className='block'>
			<div className='block__heading'>Used by <span
				className='block__heading-count'
			>{usages.length}</span></div>
			<ul className='entity-list'>
				{usages.map(repo => (
					<RepoItem key={repo.id} repo={repo} />
				))}
			</ul>
		</div>
	);
}

function ContributorsBlock({ contributors }: ContributorsBlockProps) {
	return (
		<div className='block'>
			<div className='block__heading'>Contributors</div>
			{contributors.length === 0 ? (
				<p className='block__empty'>No contributors recorded yet.</p>
			) : (
				<ul className='entity-list'>
					{contributors.map(({ person, claim }) => (
						<PersonItem
							key={person.id}
							person={person}
							claim={claim}
							detail={claim.detail || undefined}
						/>
					))}
				</ul>
			)}
		</div>
	);
}

export function RepoDetailMain({ repoId, compact, filterQuery }: Props) {
	const { claims, entityMap: map, repoDepsMap, repoUsagesMap } = useData();
	const { starred, isStarred } = useStar();
	const repo = map.get(repoId);
	const deps = useMemo(() => repoDepsMap.get(repoId) ?? [], [repoDepsMap, repoId]);
	const usages = useMemo(
		() => (repoUsagesMap.get(repoId) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
		[repoUsagesMap, repoId],
	);

	const contributorClaims = useMemo(
		() => repo ? filterClaims(claims, { relation: 'contributes-to', object: repo.id }) : [],
		[claims, repo],
	);
	const contributors = useMemo(
		() =>
			contributorClaims
				.map(c => ({ person: map.get(c.subject), claim: c }))
				.filter((x): x is { person: Entity; claim: Claim } => !!x.person)
				.sort((a, b) =>
					Number(isStarred(b.person.id)) - Number(isStarred(a.person.id)) ||
					a.person.name.localeCompare(b.person.name),
				),
		[contributorClaims, map, starred],
	);

	const projectClaims = useMemo(
		() => repo ? filterClaims(claims, { relation: 'belongs-to', subject: repo.id }) : [],
		[claims, repo],
	);
	const projects = useMemo(
		() => projectClaims
			.map(c => ({ project: map.get(c.object), claim: c }))
			.filter((x): x is {
				project: Entity;
				claim: Claim
			} => !!x.project && x.project.type === 'project')
			.sort((a, b) =>
				Number(isStarred(b.project.id)) - Number(isStarred(a.project.id)) ||
				a.project.name.localeCompare(b.project.name),
			),
		[projectClaims, map, starred],
	);

	const q = filterQuery?.trim().toLowerCase() ?? '';
	const filteredContributors = q ? contributors.filter(x => x.person.name.toLowerCase().includes(q)) : contributors;
	const filteredProjects = q ? projects.filter(x => x.project.name.toLowerCase().includes(q)) : projects;
	const filteredDeps = q ? deps.filter(x => (x.entity?.name ?? x.label).toLowerCase().includes(q)) : deps;
	const filteredUsages = q ? usages.filter(x => x.name.toLowerCase().includes(q)) : usages;
	const hasLeft = filteredProjects.length > 0 || filteredDeps.length > 0 || filteredUsages.length > 0;
	const hasRight = filteredContributors.length > 0;
	const isSplit = hasLeft && hasRight;

	if (compact) {
		return (
			<div className='popup__body'>
				<div className='popup__col'>
					<DependenciesBlock deps={deps} />
					<UsagesBlock usages={usages} />
					<ProjectsBlock projects={projects} />
					<ContributorsBlock contributors={contributors} />
				</div>
			</div>
		);
	}

	return (
		<div className='detail-main'>
			<div className={isSplit ? 'cols-2' : 'stack'}>
				{hasLeft && (
					<div className='stack'>
						<ProjectsBlock projects={filteredProjects} />
						<DependenciesBlock deps={filteredDeps} />
						<UsagesBlock usages={filteredUsages} />
					</div>
				)}
				{hasRight && (
					<div className='stack'>
						<ContributorsBlock contributors={filteredContributors} />
					</div>
				)}
			</div>
		</div>
	);
}
