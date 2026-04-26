import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { filterClaims } from '../utils/derive';
import { SquadCard } from './SquadCard';
import { PersonItem } from './PersonItem';
import { ProjectItem } from './ProjectItem';
import { RepoItem } from './RepoItem';
import { Avatar } from './Avatar';
import { Entity, Claim } from '../types';

const REPORT_TYPE_LABELS: Record<string, string> = {
	EM: 'Engineering Manager (EM)',
	SL: 'Squad Lead (SL)',
};

const MANAGES_TYPE_LABELS: Record<string, string> = {
	EM: 'Manages (EM)',
	SL: 'Manages (SL)',
};

interface Props {
	personId: string;
	compact?: boolean;
}

function SquadsBlock({ squads }: { squads: { squad: Entity; claim: Claim }[] }) {
	if (!squads.length) return null;
	return (
		<div className='pdm-section pdm-section--squads'>
			<div className='pdm-section__heading'>Squad</div>
			<div className='pdm-squads'>
				{squads.map(({ squad }) => <SquadCard key={squad.id} squad={squad} />)}
			</div>
		</div>
	);
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

function ReposBlock({ repos, heading }: {
	repos: { repo: Entity; claim: Claim }[];
	heading: string
}) {
	if (!repos.length) return null;
	return (
		<div className='pdm-section'>
			<div className='pdm-section__heading'>{heading}</div>
			<ul className='entity-list'>
				{repos.map(({ repo, claim }) => (
					<RepoItem key={repo.id} repo={repo} claim={claim} detail={claim.detail} />
				))}
			</ul>
		</div>
	);
}

interface PeopleBlockProps {
	reportsByType: Map<string, { manager: Entity; claim: Claim }[]>;
	managesByType: Map<string, { report: Entity; claim: Claim }[]>;
	reportTypes: string[];
	managesTypes: string[];
}

function PeopleBlock({
	                     reportsByType,
	                     managesByType,
	                     reportTypes,
	                     managesTypes,
                     }: PeopleBlockProps) {
	if (!reportTypes.length && !managesTypes.length) return null;
	return (
		<div className='pdm-section'>
			<div className='pdm-section__heading'>People</div>
			<div className='pdm-people'>
				{reportTypes.map(type => (
					<React.Fragment key={`reports-${type}`}>
						<div className='pdm-people__key'>{REPORT_TYPE_LABELS[type] || type}</div>
						<ul className='entity-list'>
							{reportsByType.get(type)!.map(({ manager, claim }) => (
								<PersonItem key={manager.id} person={manager} claim={claim} />
							))}
						</ul>
					</React.Fragment>
				))}
				{managesTypes.map(type => (
					<React.Fragment key={`manages-${type}`}>
						<div className='pdm-people__key'>{MANAGES_TYPE_LABELS[type] || type}</div>
						<ul className='entity-list'>
							{managesByType.get(type)!
								.sort((a, b) => a.report.name.localeCompare(b.report.name))
								.map(({ report, claim }) => (
									<PersonItem key={report.id} person={report} claim={claim} />
								))}
						</ul>
					</React.Fragment>
				))}
			</div>
		</div>
	);
}

export function PersonDetailMain({ personId, compact }: Props) {
	const { claims, entityMap: map, personRoleMap } = useData();

	const reportsClaims = useMemo(
		() => filterClaims(claims, { subject: personId, relation: 'reports-to' }),
		[claims, personId],
	);
	const managesClaims = useMemo(
		() => filterClaims(claims, { relation: 'reports-to', object: personId }),
		[claims, personId],
	);
	const teamClaims = useMemo(
		() => filterClaims(claims, { subject: personId, relation: 'member-of' }),
		[claims, personId],
	);
	const projectClaims = useMemo(
		() => filterClaims(claims, { subject: personId, relation: 'works-on' }),
		[claims, personId],
	);
	const repoClaims = useMemo(
		() => filterClaims(claims, { subject: personId, relation: 'contributes-to' }),
		[claims, personId],
	);

	const reportsByType = useMemo(() => {
		const m = new Map<string, { manager: Entity; claim: Claim }[]>();
		for (const c of reportsClaims) {
			const mgr = map.get(c.object);
			if (!mgr) continue;
			const type = c.detail || 'Reports to';
			if (!m.has(type)) m.set(type, []);
			m.get(type)!.push({ manager: mgr, claim: c });
		}
		return m;
	}, [reportsClaims, map]);

	const managesByType = useMemo(() => {
		const m = new Map<string, { report: Entity; claim: Claim }[]>();
		for (const c of managesClaims) {
			const report = map.get(c.subject);
			if (!report) continue;
			const type = c.detail || 'Direct Reports';
			if (!m.has(type)) m.set(type, []);
			m.get(type)!.push({ report, claim: c });
		}
		return m;
	}, [managesClaims, map]);

	const knownTypes = ['EM', 'SL'];
	const reportTypes = [
		...knownTypes.filter(t => reportsByType.has(t)),
		...[...reportsByType.keys()].filter(t => !knownTypes.includes(t)),
	];
	const managesTypes = [
		...knownTypes.filter(t => managesByType.has(t)),
		...[...managesByType.keys()].filter(t => !knownTypes.includes(t)),
	];

	const squads = useMemo(
		() => teamClaims
			.map(c => ({ squad: map.get(c.object), claim: c }))
			.filter((x): x is { squad: Entity; claim: Claim } => !!x.squad)
			.sort((a, b) => a.squad.name.localeCompare(b.squad.name)),
		[teamClaims, map],
	);

	const projects = useMemo(
		() => projectClaims
			.map(c => ({ project: map.get(c.object), claim: c }))
			.filter((x): x is {
				project: Entity;
				claim: Claim
			} => !!x.project && x.project.type === 'project')
			.sort((a, b) => a.project.name.localeCompare(b.project.name)),
		[projectClaims, map],
	);

	const repos = useMemo(() => {
		const seen = new Set<string>();
		return [
			...repoClaims,
			...projectClaims.filter(c => map.get(c.object)?.type === 'repo'),
		]
			.map(c => ({ repo: map.get(c.object), claim: c }))
			.filter((x): x is { repo: Entity; claim: Claim } => !!x.repo && x.repo.type === 'repo')
			.filter(x => {
				if (seen.has(x.repo.id)) return false;
				seen.add(x.repo.id);
				return true;
			})
			.sort((a, b) => a.repo.name.localeCompare(b.repo.name));
	}, [repoClaims, projectClaims, map]);

	const isEmpty = squads.length === 0 && projects.length === 0 && repos.length === 0 &&
		reportTypes.length === 0 && managesTypes.length === 0;

	const hasLeft = squads.length > 0 || repos.length > 0 || reportTypes.length > 0 || managesTypes.length > 0;
	const hasRight = projects.length > 0;
	const isSplit = hasLeft && hasRight;

	const peopleProps: PeopleBlockProps = {
		reportsByType,
		managesByType,
		reportTypes,
		managesTypes,
	};

	if (compact) {
		const person = map.get(personId);
		const roleTitle = personRoleMap.get(personId);
		return (
			<div className='person-popup'>
				<Link to={`/person/${personId}`} className='person-popup__title'>
					{person && <Avatar name={person.name} id={person.id} size='sm' />}
					<span
						className='font-display person-popup__name'
					>{person?.name ?? personId}</span>
					{roleTitle && <span className='person-popup__role'>{roleTitle}</span>}
				</Link>
				<div className={`person-popup__body${isSplit ? ' person-popup__body--split' : ''}`}>
					{hasLeft && (
						<div className='person-popup__col'>
							<SquadsBlock squads={squads} />
							<ReposBlock repos={repos} heading='Repos' />
							<PeopleBlock {...peopleProps} />
						</div>
					)}
					{hasRight && (
						<div className='person-popup__col'>
							<ProjectsBlock projects={projects} />
						</div>
					)}
					{isEmpty && (
						<div className='person-popup__col'>
							<p className='dl-table__empty'>No assignments recorded yet.</p>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className='detail-main'>
			{isEmpty ? (
				<div className='pdm-section'>
					<p className='dl-table__empty'>No assignments recorded yet.</p>
				</div>
			) : (
				<div className={isSplit ? 'pdm-cols pdm-cols--split' : 'pdm-cols'}>
					{hasLeft && (
						<div className='pdm-col'>
							<SquadsBlock squads={squads} />
							<ReposBlock repos={repos} heading='Other Repos' />
							<PeopleBlock {...peopleProps} />
						</div>
					)}
					{hasRight && (
						<div className='pdm-col'>
							<ProjectsBlock projects={projects} />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
