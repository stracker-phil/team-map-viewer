import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderGit2, ArrowLeft, FileText } from 'lucide-react';
import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { entityMap, filterClaims } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { StaleTag } from '../components/StaleTag';
import { LinksSidebar } from '../components/LinksSidebar';
import { OrgChart } from '../components/OrgChart';
import { Claim } from '../types';

const ROLE_ORDER = ['TL', 'PM', 'PO', 'dev', 'QA', 'design', ''];

const ROLE_LABELS: Record<string, string> = {
  TL: 'Team Lead',
  PM: 'Project Manager',
  PO: 'Product Owner',
  dev: 'Engineering',
  QA: 'Quality Assurance',
  design: 'Design',
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { entities, claims, links } = useData();
  const navigate = useNavigate();
  const map = entityMap(entities);
  const project = id ? map.get(id) : undefined;

  const ownerClaim = project ? filterClaims(claims, { subject: project.id, relation: 'owned-by' })[0] : undefined;
  const owningTeam = ownerClaim ? map.get(ownerClaim.object) : undefined;
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

  if (!project || project.type !== 'project') {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">Not found.</div>
        <h2 className="empty-state__title">Project not found</h2>
        <p>ID: {id}</p>
        <button className="btn-outline" onClick={() => navigate('/')}>Back to overview</button>
      </div>
    );
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={13} />
        BACK TO OVERVIEW
      </button>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="entity-header">
          <span className="entity-header__icon"><FolderGit2 size={24} /></span>
          <div style={{ flex: 1 }}>
            <div className="entity-header__eyebrow">PROJECT</div>
            <h2 className="entity-header__title">{project.name}</h2>
            {project.meta && (
              <div className="entity-header__meta">Client: {project.meta}</div>
            )}
          </div>
        </div>

        <div className="detail-layout">
          <div className="detail-main">
            {/* Meta section */}
            <div className="dl-section">
              <div className="dl-section__heading">META</div>
              {owningTeam ? (
                <dl className="dl-table">
                  <dt className="dl-table__key">Owner</dt>
                  <dd className="dl-table__value">
                    <EntityLink entity={owningTeam} />
                    {ownerClaim && <StaleTag verified={ownerClaim.verified} />}
                  </dd>
                </dl>
              ) : (
                <p className="dl-table__empty">No owner recorded yet.</p>
              )}
            </div>

            {/* People section: org chart on desktop, grouped list on mobile */}
            <div className="dl-section">
              <div className="dl-section__heading">PEOPLE</div>

              {/* Org chart — hidden on narrow screens */}
              <div className="org-chart-wrap">
                <OrgChart
                  claims={worksClaims}
                  entityMap={map}
                  projectName={project.name}
                />
              </div>

              {/* Fallback grouped list — shown on narrow screens */}
              <div className="people-fallback">
                {worksClaims.length === 0 ? (
                  <p className="dl-table__empty">No team members recorded yet.</p>
                ) : (
                  <dl className="dl-table">
                    {ROLE_ORDER
                      .filter(r => grouped[r]?.length)
                      .map(r => {
                        const roleClaims = grouped[r];
                        const people = roleClaims
                          .map(c => ({ person: map.get(c.subject), claim: c }))
                          .filter((x): x is { person: NonNullable<typeof x.person>; claim: Claim } => !!x.person)
                          .sort((a, b) => a.person.name.localeCompare(b.person.name));
                        if (!people.length) return null;
                        return (
                          <React.Fragment key={r || '_other'}>
                            <dt className="dl-table__key">
                              {ROLE_LABELS[r] || r || 'Other'}
                            </dt>
                            <dd className="dl-table__value">
                              {people.map(({ person, claim }, i) => (
                                <span key={person.id}>
                                  {i > 0 && ', '}
                                  <EntityLink entity={person} />
                                  <StaleTag verified={claim.verified} />
                                </span>
                              ))}
                            </dd>
                          </React.Fragment>
                        );
                      })}
                  </dl>
                )}
              </div>
            </div>

            {/* Sources block — de-emphasized */}
            {sources.length > 0 && (
              <div className="sources-block sources-block--quiet">
                <div className="sources-block__label">
                  <FileText size={11} />
                  SOURCES
                </div>
                <ul className="sources-block__list">
                  {sources.map(([src, count]) => (
                    <li key={src} className="sources-block__item">
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

          <LinksSidebar links={links} entityId={project.id} />
        </div>
      </div>
    </div>
  );
}
