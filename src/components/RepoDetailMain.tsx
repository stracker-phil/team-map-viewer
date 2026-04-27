import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';
import { filterClaims } from '../utils/derive';
import { PersonItem } from './PersonItem';
import { ProjectItem } from './ProjectItem';
import { Entity, Claim } from '../types';

interface Props {
	repoId: string;
	compact?: boolean;
}

interface ContributorsBlockProps {
	contributors: { person: Entity; claim: Claim }[];
}

function ProjectsBlock({ projects }: { projects: { project: Entity; claim: Claim }[] }) {
	if (!projects.length) return null;
	return (
		<div className='pdm-section'>
			<div className='pdm-section__heading'>Projects</div>
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

function ContributorsBlock({ contributors }: ContributorsBlockProps) {
	return (
		<div className='pdm-section'>
			<div className='pdm-section__heading'>Contributors</div>
			{contributors.length === 0 ? (
				<p className='dl-table__empty'>No contributors recorded yet.</p>
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

export function RepoDetailMain({ repoId, compact }: Props) {
	const { claims, entityMap: map } = useData();
	const { starred, isStarred } = useStar();
	const repo = map.get(repoId);

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

	if (compact) {
		return (
			<div className='repo-popup'>
				<Link to={`/repo/${repoId}`} className='repo-popup__title'>
					<GitBranch size={14} className='repo-popup__icon' />
					<span className='font-mono repo-popup__name'>{repo?.name ?? repoId}</span>
					{repo?.meta && <span className='repo-popup__meta'>{repo.meta}</span>}
				</Link>
				<div className='repo-popup__body'>
					<div className='repo-popup__col'>
						<ProjectsBlock projects={projects} />
						<ContributorsBlock contributors={contributors} />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='detail-main'>
			<ProjectsBlock projects={projects} />
			<ContributorsBlock contributors={contributors} />
		</div>
	);
}
