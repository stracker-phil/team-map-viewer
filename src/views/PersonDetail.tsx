import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { entityMap, filterClaims, personRoleMap } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { StaleTag } from '../components/StaleTag';
import { Avatar } from '../components/Avatar';
import { LinksSidebar } from '../components/LinksSidebar';
import { Entity, Claim } from '../types';

const REPORT_TYPE_LABELS: Record<string, string> = {
  EM: 'Engineering Manager (EM)',
  SL: 'Squad Lead (SL)',
};

const MANAGES_TYPE_LABELS: Record<string, string> = {
  EM: 'Manages (EM)',
  SL: 'Manages (SL)',
};

export function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const { entities, claims, links } = useData();
  const navigate = useNavigate();
  const map = entityMap(entities);
  const roleMap = useMemo(() => personRoleMap(claims), [claims]);
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
  const managesClaims = filterClaims(claims, { relation: 'reports-to', object: person.id });
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

  // People who report to this person (reverse of reports-to)
  const managesByType = new Map<string, { report: Entity; claim: Claim }[]>();
  for (const c of managesClaims) {
    const report = map.get(c.subject);
    if (!report) continue;
    const type = c.detail || 'Direct Reports';
    if (!managesByType.has(type)) managesByType.set(type, []);
    managesByType.get(type)!.push({ report, claim: c });
  }
  const managesTypes = [
    ...knownTypes.filter(t => managesByType.has(t)),
    ...[...managesByType.keys()].filter(t => !knownTypes.includes(t)),
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
            {(roleMap.get(person.id) || person.meta) && (
              <div className="entity-header__meta">{roleMap.get(person.id) || person.meta}</div>
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
                      <dd className="dl-table__value dl-table__value--avatars">
                        {projects.map(({ project, claim }) => (
                          <span key={project.id}>
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

            {/* People section — reports-to relationships + manages */}
            <div className="dl-section">
              <div className="dl-section__heading">PEOPLE</div>
              {reportTypes.length === 0 && managesTypes.length === 0 ? (
                <p className="dl-table__empty">No reporting line recorded yet.</p>
              ) : (
                <dl className="dl-table">
                  {reportTypes.map(type => {
                    const entries = reportsByType.get(type)!;
                    return (
                      <React.Fragment key={`reports-${type}`}>
                        <dt className="dl-table__key">
                          {REPORT_TYPE_LABELS[type] || type}
                        </dt>
                        <dd className="dl-table__value dl-table__value--avatars">
                          {entries.map(({ manager, claim }) => (
                            <span key={manager.id} className="dl-person">
                              <Avatar name={manager.name} id={manager.id} size="sm" />
                              <EntityLink entity={manager} />
                              <StaleTag verified={claim.verified} />
                            </span>
                          ))}
                        </dd>
                      </React.Fragment>
                    );
                  })}
                  {managesTypes.map(type => {
                    const entries = managesByType.get(type)!
                      .sort((a, b) => a.report.name.localeCompare(b.report.name));
                    return (
                      <React.Fragment key={`manages-${type}`}>
                        <dt className="dl-table__key">
                          {MANAGES_TYPE_LABELS[type] || type}
                        </dt>
                        <dd className="dl-table__value dl-table__value--avatars">
                          {entries.map(({ report, claim }) => (
                            <span key={report.id} className="dl-person">
                              <Avatar name={report.name} id={report.id} size="sm" />
                              <EntityLink entity={report} />
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
