import React, { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useStar } from '../context/StarContext';
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
	filterQuery?: string;
}

function OwnerBlock({ owner }: { owner: Entity }) {
	return (
		<div className='block block--bare'>
			<div className='block__heading'>Owner</div>
			<div className='stack stack--tight'>
				<SquadCard squad={owner} />
			</div>
		</div>
	);
}

interface PeopleContentProps {
	grouped: Record<string, Claim[]>;
	entityMap: Map<string, Entity>;
	isStarred: (id: string) => boolean;
}

function PeopleContent({ grouped, entityMap: map, isStarred }: PeopleContentProps) {
	const hasAny = ROLE_ORDER.some(r => grouped[r]?.length);
	if (!hasAny) return <p className='block__empty'>No team members recorded yet.</p>;
	return (
		<dl className='pdm-people'>
			{ROLE_ORDER.filter(r => grouped[r]?.length).map(r => {
				const people = grouped[r]
					.map(c => ({ person: map.get(c.subject), claim: c }))
					.filter((x): x is { person: Entity; claim: Claim } => !!x.person)
					.sort((a, b) =>
						Number(isStarred(b.person.id)) - Number(isStarred(a.person.id)) ||
						a.person.name.localeCompare(b.person.name),
					);
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
		<div className='block'>
			<div className='block__heading'>Repos</div>
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
		<div className='block'>
			<div className='block__heading'>People</div>
			<PeopleContent {...props} />
		</div>
	);
}

export function ProjectDetailMain({ projectId, compact, filterQuery }: Props) {
	const { claims, entityMap: map } = useData();
	const { starred, isStarred } = useStar();
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
			.sort((a, b) =>
				Number(isStarred(b.repo.id)) - Number(isStarred(a.repo.id)) ||
				a.repo.name.localeCompare(b.repo.name),
			),
		[repoClaims, map, starred],
	);

	const q = filterQuery?.trim().toLowerCase() ?? '';
	const filteredRepos = q ? repos.filter(x => x.repo.name.toLowerCase().includes(q)) : repos;
	const filteredGrouped = useMemo(() => {
		if (!q) return grouped;
		const result: Record<string, Claim[]> = {};
		for (const [key, claimList] of Object.entries(grouped)) {
			const filtered = claimList.filter(c => map.get(c.subject)?.name.toLowerCase().includes(q));
			if (filtered.length) result[key] = filtered;
		}
		return result;
	}, [grouped, map, q]);

	const owningTeam = ownerClaim ? map.get(ownerClaim.object) : undefined;
	const peopleProps: PeopleContentProps = { grouped: filteredGrouped, entityMap: map, isStarred };

	if (compact) {
		return (
			<div className='popup__body popup__body--split'>
				<div className='popup__col'>
					{owningTeam && (
						<OwnerBlock owner={owningTeam} />
					)}
					<ReposBlock repos={repos} />
				</div>
				<div className='popup__col'>
					<PeopleBlock {...peopleProps} />
				</div>
			</div>
		);
	}

	return (
		<div className='detail-main'>
			{owningTeam ? (
				<OwnerBlock owner={owningTeam} />
			) : (
				<div className='block'>
					<p className='block__empty'>No owner recorded yet.</p>
				</div>
			)}

			<ReposBlock repos={filteredRepos} />

			<div className='block'>
				<div className='block__heading'>People</div>
				<div className='org-chart-wrap'>
					<OrgChart
						claims={q ? worksClaims.filter(c => map.get(c.subject)?.name.toLowerCase().includes(q)) : worksClaims}
						entityMap={map} projectName={project?.name ?? ''}
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
