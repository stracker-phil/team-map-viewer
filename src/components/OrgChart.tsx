import { useMemo } from 'react';
import { Entity, Claim } from '../types';
import { EntityLink } from './EntityLink';
import { Avatar } from './Avatar';
import { StaleTag } from './StaleTag';

const ROLE_LABELS: Record<string, string> = {
  TL: 'Team Lead',
  PM: 'Project Manager',
  PO: 'Product Owner',
  dev: 'Engineering',
  QA: 'Quality Assurance',
  design: 'Design',
};

const BRANCH_ROLE_ORDER = ['PM', 'PO', 'dev', 'QA', 'design'];

interface OrgChartProps {
  claims: Claim[];
  entityMap: Map<string, Entity>;
  projectName: string;
}

function OrgNode({
  person,
  claim,
  size,
}: {
  person: Entity;
  claim: Claim;
  size: 'sm' | 'md';
}) {
  return (
    <div className={`org-node org-node--${size}`}>
      <Avatar name={person.name} id={person.id} size={size} />
      <div className="org-node__info">
        <EntityLink entity={person} />
        {person.meta && <span className="org-node__title">{person.meta}</span>}
      </div>
      <StaleTag verified={claim.verified} />
    </div>
  );
}

export function OrgChart({ claims, entityMap: map, projectName }: OrgChartProps) {
  const grouped = useMemo(() => {
    const result: Record<string, Claim[]> = {};
    for (const c of claims) {
      (result[c.detail || ''] ??= []).push(c);
    }
    return result;
  }, [claims]);

  const tlPeople = useMemo(
    () =>
      (grouped['TL'] ?? [])
        .map(c => ({ person: map.get(c.subject), claim: c }))
        .filter((x): x is { person: Entity; claim: Claim } => !!x.person),
    [grouped, map],
  );

  const branches = useMemo(
    () =>
      BRANCH_ROLE_ORDER
        .filter(r => grouped[r]?.length)
        .map(r => ({
          role: r,
          label: ROLE_LABELS[r] || r,
          people: (grouped[r] ?? [])
            .map(c => ({ person: map.get(c.subject), claim: c }))
            .filter((x): x is { person: Entity; claim: Claim } => !!x.person)
            .sort((a, b) => a.person.name.localeCompare(b.person.name)),
        })),
    [grouped, map],
  );

  const hasRoot = tlPeople.length > 0;
  const hasBranches = branches.length > 0;

  if (!hasRoot && !hasBranches) {
    return (
      <div className="org-chart__empty">No team members recorded yet.</div>
    );
  }

  return (
    <div className="org-chart">
      {hasRoot && (
        <div className="org-chart__root">
          {tlPeople.map(({ person, claim }) => (
            <OrgNode key={person.id} person={person} claim={claim} size="md" />
          ))}
        </div>
      )}

      {hasBranches && (
        <>
          {hasRoot && <div className="org-chart__stem" />}
          <div className="org-chart__branches-wrap">
            <div className="org-chart__branches">
              {branches.map(branch => (
                <div key={branch.role} className="org-branch">
                  <div className="org-branch__stem" />
                  <div className="org-branch__label">{branch.label}</div>
                  <div className="org-branch__nodes">
                    {branch.people.map(({ person, claim }) => (
                      <OrgNode key={person.id} person={person} claim={claim} size="sm" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!hasRoot && !hasBranches && (
        <p className="org-chart__empty">{projectName} — no team recorded yet.</p>
      )}
    </div>
  );
}
