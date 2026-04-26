import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { filterClaims } from '../utils/derive';
import { OrgChart } from './OrgChart';
import { SquadCard } from './SquadCard';
import { PersonItem } from './PersonItem';
import { RepoItem } from './RepoItem';
import { Entity, Claim } from '../types';

const ROLE_ORDER = ['TL', 'PM', 'PO', 'dev', 'QA', 'design', ''];

const ROLE_LABELS: Record<string, string> = {
	TL: 'Team Lead',
	PM: 'Project Manager',
	PO: 'Product Owner',
	dev: 'Engineering',
	QA: 'Quality Assurance',
	design: 'Design',
};

interface Props {
	projectId: string;
	compact?: boolean;
}

function OwnerBlock({ owner }: { owner: Entity }) {
	return (
		<div className='pdm-section pdm-section--squads'>
			<div className='pdm-section__heading'>Owner</div>
			<div className='pdm-squads'>
				<SquadCard squad={owner} />
			</div>
		</div>
	);
}

interface PeopleContentProps {
	grouped: Record<string, Claim[]>;
	entityMap: Map<string, Entity>;
}

function PeopleContent({ grouped, entityMap: map }: PeopleContentProps) {
	const hasAny = ROLE_ORDER.some(r => grouped[r]?.length);
	if (!hasAny) return <p className='dl-table__empty'>No team members recorded yet.</p>;
	return (
		<dl className='pdm-people'>
			{ROLE_ORDER.filter(r => grouped[r]?.length).map(r => {
				const people = grouped[r]
					.map(c => ({ person: map.get(c.subject), claim: c }))
					.filter((x): x is { person: Entity; claim: Claim } => !!x.person)
					.sort((a, b) => a.person.name.localeCompare(b.person.name));
				if (!people.length) return null;
				return (
					<React.Fragment key={r || '_other'}>
						<dt className='pdm-people__key'>{ROLE_LABELS[r] || r || 'Other'}</dt>
						<dd className='pdm-people__value'>
							<ul className='entity-list'>
								{people.map(({ person, claim }) => (
									<PersonItem key={person.id} person={person} claim={claim} />
								))}
							</ul>
						</dd>
					</React.Fragment>
				);
			})}
		</dl>
	);
}

function ReposBlock({ repos }: { repos: { repo: Entity; claim: Claim }[] }) {
	if (!repos.length) return null;
	return (
		<div className='pdm-section'>
			<div className='pdm-section__heading'>Repos</div>
			<ul className='entity-list'>
				{repos.map(({ repo, claim }) => (
					<RepoItem key={repo.id} repo={repo} claim={claim} detail={claim.detail} />
				))}
			</ul>
		</div>
	);
}

function PeopleBlock(props: PeopleContentProps) {
	return (
		<div className='pdm-section'>
			<div className='pdm-section__heading'>People</div>
			<PeopleContent {...props} />
		</div>
	);
}

export function ProjectDetailMain({ projectId, compact }: Props) {
	const { claims, entityMap: map } = useData();
	const project = map.get(projectId);

	const ownerClaim = useMemo(
		() => project ? filterClaims(claims, {
			subject: project.id,
			relation: 'owned-by',
		})[0] : undefined,
		[claims, project],
	);
	const worksClaims = useMemo(
		() => project ? filterClaims(claims, { relation: 'works-on', object: project.id }) : [],
		[claims, project],
	);
	const grouped = useMemo(() => {
		const result: Record<string, Claim[]> = {};
		for (const c of worksClaims) {
			const key = c.detail || '';
			(result[key] ??= []).push(c);
		}
		return result;
	}, [worksClaims]);
	const sources = useMemo(() => {
		const m = new Map<string, number>();
		const all = ownerClaim ? [...worksClaims, ownerClaim] : worksClaims;
		all.forEach(c => {
			if (!c.source) return;
			m.set(c.source, (m.get(c.source) ?? 0) + 1);
		});
		return [...m.entries()];
	}, [worksClaims, ownerClaim]);

	const repoClaims = useMemo(
		() => project ? filterClaims(claims, { relation: 'belongs-to', object: project.id }) : [],
		[claims, project],
	);
	const repos = useMemo(
		() => repoClaims
			.map(c => ({ repo: map.get(c.subject), claim: c }))
			.filter((x): x is { repo: Entity; claim: Claim } => !!x.repo && x.repo.type === 'repo')
			.sort((a, b) => a.repo.name.localeCompare(b.repo.name)),
		[repoClaims, map],
	);

	const owningTeam = ownerClaim ? map.get(ownerClaim.object) : undefined;
	const peopleProps: PeopleContentProps = { grouped, entityMap: map };

	if (compact) {
		return (
			<div className='project-popup'>
				<Link to={`/project/${projectId}`} className='project-popup__title'>
					<FolderGit2 size={14} className='project-popup__icon' />
					<span
						className='font-display project-popup__name'
					>{project?.name ?? projectId}</span>
					{project?.meta &&
						<span className='project-popup__meta'>Client: {project.meta}</span>}
				</Link>
				<div className='project-popup__body'>
					<div className='project-popup__col'>
						{owningTeam && (
							<OwnerBlock owner={owningTeam} />
						)}
						<ReposBlock repos={repos} />
						<PeopleBlock {...peopleProps} />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='detail-main'>
			{owningTeam ? (
				<OwnerBlock owner={owningTeam} />
			) : (
				<div className='pdm-section'>
					<p className='dl-table__empty'>No owner recorded yet.</p>
				</div>
			)}

			<ReposBlock repos={repos} />

			<div className='pdm-section'>
				<div className='pdm-section__heading'>People</div>
				<div className='org-chart-wrap'>
					<OrgChart
						claims={worksClaims} entityMap={map} projectName={project?.name ?? ''}
					/>
				</div>
				<div className='people-fallback'>
					<PeopleContent {...peopleProps} />
				</div>
			</div>

			{sources.length > 0 && (
				<div className='sources-block sources-block--quiet'>
					<div className='sources-block__label'>
						<FileText size={11} />
						SOURCES
					</div>
					<ul className='sources-block__list'>
						{sources.map(([src, count]) => (
							<li key={src} className='sources-block__item'>
								<span style={{ color: 'var(--muted-light)' }}>→</span>
								<span>{src}</span>
								<span style={{ color: 'var(--muted-light)' }}>
                  ({count} claim{count !== 1 ? 's' : ''})
                </span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
