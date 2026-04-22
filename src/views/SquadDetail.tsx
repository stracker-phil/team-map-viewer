import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Boxes, ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { entityMap, filterClaims } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { StaleTag } from '../components/StaleTag';
import { Avatar } from '../components/Avatar';
import { LinksSidebar } from '../components/LinksSidebar';
import { Entity, Claim } from '../types';

export function SquadDetail() {
  const { id } = useParams<{ id: string }>();
  const { entities, claims, links } = useData();
  const navigate = useNavigate();
  const map = entityMap(entities);
  const squad = id ? map.get(id) : undefined;

  if (!squad || squad.type !== 'squad') {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">Not found.</div>
        <h2 className="empty-state__title">Team not found</h2>
        <button className="btn-outline" onClick={() => navigate('/')}>Back to overview</button>
      </div>
    );
  }

  const memberClaims = filterClaims(claims, { relation: 'member-of', object: squad.id });
  const ownedClaims = filterClaims(claims, { relation: 'owned-by', object: squad.id });

  // Group members by job title (meta)
  const membersByRole = useMemo(() => {
    const groups = new Map<string, { person: Entity; claim: Claim }[]>();
    for (const c of memberClaims) {
      const person = map.get(c.subject);
      if (!person) continue;
      const role = person.meta || 'Other';
      if (!groups.has(role)) groups.set(role, []);
      groups.get(role)!.push({ person, claim: c });
    }
    // Sort alphabetically by role, people within role alphabetically by name
    return [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([role, items]) => ({
        role,
        items: items.sort((a, b) => a.person.name.localeCompare(b.person.name)),
      }));
  }, [memberClaims, map]);

  const ownedProjects = ownedClaims
    .map(c => ({ project: map.get(c.subject), claim: c }))
    .filter((x): x is { project: Entity; claim: Claim } => !!x.project)
    .sort((a, b) => a.project.name.localeCompare(b.project.name));

  return (
    <div>
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={13} />
        BACK TO OVERVIEW
      </button>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="entity-header">
          <span className="entity-header__icon"><Boxes size={24} /></span>
          <div style={{ flex: 1 }}>
            <div className="entity-header__eyebrow">SQUAD</div>
            <h2 className="entity-header__title">{squad.name}</h2>
            {squad.meta && (
              <div className="entity-header__meta">{squad.meta}</div>
            )}
          </div>
        </div>

        <div className="detail-layout">
          <div className="detail-main">
            {/* Meta section */}
            <div className="dl-section">
              <div className="dl-section__heading">META</div>
              {ownedProjects.length > 0 ? (
                <dl className="dl-table">
                  <dt className="dl-table__key">Owned projects</dt>
                  <dd className="dl-table__value">
                    {ownedProjects.map(({ project, claim }, i) => (
                      <span key={project.id}>
                        {i > 0 && ', '}
                        <EntityLink entity={project} />
                        <StaleTag verified={claim.verified} />
                      </span>
                    ))}
                  </dd>
                </dl>
              ) : (
                <p className="dl-table__empty">No owned projects recorded yet.</p>
              )}
            </div>

            {/* People section */}
            <div className="dl-section">
              <div className="dl-section__heading">PEOPLE</div>
              {membersByRole.length === 0 ? (
                <p className="dl-table__empty">No members recorded yet.</p>
              ) : (
                <dl className="dl-table">
                  {membersByRole.map(({ role, items }) => (
                    <React.Fragment key={role}>
                      <dt className="dl-table__key">{role}</dt>
                      <dd className="dl-table__value dl-table__value--avatars">
                        {items.map(({ person, claim }, i) => (
                          <span key={person.id} className="dl-person">
                            {i > 0 && <span className="dl-person__sep">, </span>}
                            <Avatar name={person.name} id={person.id} size="sm" />
                            <EntityLink entity={person} />
                            <StaleTag verified={claim.verified} />
                          </span>
                        ))}
                      </dd>
                    </React.Fragment>
                  ))}
                </dl>
              )}
            </div>
          </div>

          <LinksSidebar links={links} entityId={squad.id} />
        </div>
      </div>
    </div>
  );
}
