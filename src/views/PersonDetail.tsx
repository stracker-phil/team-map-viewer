import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { entityMap, filterClaims } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { StaleTag } from '../components/StaleTag';
import { Avatar } from '../components/Avatar';
import { LinksSidebar } from '../components/LinksSidebar';
import { Entity, Claim } from '../types';

const REPORT_TYPE_LABELS: Record<string, string> = {
  EM: 'Engineering Manager (EM)',
  SL: 'Squad Lead (SL)',
};

export function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const { entities, claims, links } = useData();
  const navigate = useNavigate();
  const map = entityMap(entities);
  const person = id ? map.get(id) : undefined;

  if (!person || person.type !== 'person') {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">Not found.</div>
        <h2 className="empty-state__title">Person not found</h2>
        <p>ID: {id}</p>
        <button className="btn-outline" onClick={() => navigate('/')}>Back to overview</button>
      </div>
    );
  }

  const reportsClaims = filterClaims(claims, { subject: person.id, relation: 'reports-to' });
  const teamClaims = filterClaims(claims, { subject: person.id, relation: 'member-of' });
  const projectClaims = filterClaims(claims, { subject: person.id, relation: 'works-on' });

  // Group reports-to by detail (EM, SL, etc.)
  const reportsByType = new Map<string, { manager: Entity; claim: Claim }[]>();
  for (const c of reportsClaims) {
    const mgr = map.get(c.object);
    if (!mgr) continue;
    const type = c.detail || 'Reports to';
    if (!reportsByType.has(type)) reportsByType.set(type, []);
    reportsByType.get(type)!.push({ manager: mgr, claim: c });
  }

  // Known types first, then others
  const knownTypes = ['EM', 'SL'];
  const reportTypes = [
    ...knownTypes.filter(t => reportsByType.has(t)),
    ...[...reportsByType.keys()].filter(t => !knownTypes.includes(t)),
  ];

  const squads = teamClaims
    .map(c => ({ squad: map.get(c.object), claim: c }))
    .filter((x): x is { squad: Entity; claim: Claim } => !!x.squad)
    .sort((a, b) => a.squad.name.localeCompare(b.squad.name));

  const projects = projectClaims
    .map(c => ({ project: map.get(c.object), claim: c }))
    .filter((x): x is { project: Entity; claim: Claim } => !!x.project)
    .sort((a, b) => a.project.name.localeCompare(b.project.name));

  return (
    <div>
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={13} />
        BACK TO OVERVIEW
      </button>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="entity-header entity-header--person">
          <Avatar name={person.name} id={person.id} size="lg" />
          <div style={{ flex: 1 }}>
            <div className="entity-header__eyebrow">PERSON</div>
            <h2 className="entity-header__title">{person.name}</h2>
            {person.meta && (
              <div className="entity-header__meta">{person.meta}</div>
            )}
          </div>
        </div>

        <div className="detail-layout">
          <div className="detail-main">
            {/* Meta section */}
            <div className="dl-section">
              <div className="dl-section__heading">META</div>
              {squads.length === 0 && projects.length === 0 ? (
                <p className="dl-table__empty">No assignments recorded yet.</p>
              ) : (
                <dl className="dl-table">
                  {squads.length > 0 && (
                    <React.Fragment key="squads">
                      <dt className="dl-table__key">Squads</dt>
                      <dd className="dl-table__value">
                        {squads.map(({ squad, claim }, i) => (
                          <span key={squad.id}>
                            {i > 0 && ', '}
                            <EntityLink entity={squad} />
                            <StaleTag verified={claim.verified} />
                          </span>
                        ))}
                      </dd>
                    </React.Fragment>
                  )}
                  {projects.length > 0 && (
                    <React.Fragment key="projects">
                      <dt className="dl-table__key">Contributes to</dt>
                      <dd className="dl-table__value">
                        {projects.map(({ project, claim }, i) => (
                          <span key={project.id}>
                            {i > 0 && ', '}
                            <EntityLink entity={project} />
                            {claim.detail && (
                              <span className="dl-role-inline"> ({claim.detail})</span>
                            )}
                            <StaleTag verified={claim.verified} />
                          </span>
                        ))}
                      </dd>
                    </React.Fragment>
                  )}
                </dl>
              )}
            </div>

            {/* People section — reports-to relationships */}
            <div className="dl-section">
              <div className="dl-section__heading">PEOPLE</div>
              {reportTypes.length === 0 ? (
                <p className="dl-table__empty">No reporting line recorded yet.</p>
              ) : (
                <dl className="dl-table">
                  {reportTypes.map(type => {
                    const entries = reportsByType.get(type)!;
                    return (
                      <React.Fragment key={type}>
                        <dt className="dl-table__key">
                          {REPORT_TYPE_LABELS[type] || type}
                        </dt>
                        <dd className="dl-table__value dl-table__value--avatars">
                          {entries.map(({ manager, claim }, i) => (
                            <span key={manager.id} className="dl-person">
                              {i > 0 && <span className="dl-person__sep">, </span>}
                              <Avatar name={manager.name} id={manager.id} size="sm" />
                              <EntityLink entity={manager} />
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

          <LinksSidebar links={links} entityId={person.id} />
        </div>
      </div>
    </div>
  );
}
