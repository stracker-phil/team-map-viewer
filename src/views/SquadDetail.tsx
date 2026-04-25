import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Boxes, ArrowLeft, ChevronRight } from 'lucide-react';
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

  const [hovered, setHovered] = useState<{ type: 'person' | 'project'; id: string } | null>(null);

  const memberClaims = useMemo(
    () => squad ? filterClaims(claims, { relation: 'member-of', object: squad.id }) : [],
    [claims, squad],
  );
  const ownedClaims = useMemo(
    () => squad ? filterClaims(claims, { relation: 'owned-by', object: squad.id }) : [],
    [claims, squad],
  );

  const teamSize = useMemo(() => {
    const m: Record<string, number> = {};
    filterClaims(claims, { relation: 'works-on' }).forEach(c => {
      m[c.object] = (m[c.object] ?? 0) + 1;
    });
    return m;
  }, [claims]);

  const membersByRole = useMemo(() => {
    const groups = new Map<string, { person: Entity; claim: Claim }[]>();
    for (const c of memberClaims) {
      const person = map.get(c.subject);
      if (!person) continue;
      const role = person.meta || 'Other';
      if (!groups.has(role)) groups.set(role, []);
      groups.get(role)!.push({ person, claim: c });
    }
    return [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([role, items]) => ({
        role,
        items: items.sort((a, b) => a.person.name.localeCompare(b.person.name)),
      }));
  }, [memberClaims, map]);

  const ownedProjects = useMemo(
    () => ownedClaims
      .map(c => ({ project: map.get(c.subject), claim: c }))
      .filter((x): x is { project: Entity; claim: Claim } => !!x.project && (teamSize[x.project.id] ?? 0) > 0)
      .sort((a, b) => a.project.name.localeCompare(b.project.name)),
    [ownedClaims, map, teamSize],
  );

  const { personProjects, projectPeople } = useMemo(() => {
    const memberIds = new Set(memberClaims.map(c => c.subject));
    const projectIds = new Set(ownedClaims.map(c => c.subject));
    const worksOn = filterClaims(claims, { relation: 'works-on' });

    const pp = new Map<string, Set<string>>();
    const qp = new Map<string, Set<string>>();

    for (const c of worksOn) {
      if (!memberIds.has(c.subject) || !projectIds.has(c.object)) continue;
      if (!pp.has(c.subject)) pp.set(c.subject, new Set());
      pp.get(c.subject)!.add(c.object);
      if (!qp.has(c.object)) qp.set(c.object, new Set());
      qp.get(c.object)!.add(c.subject);
    }

    return { personProjects: pp, projectPeople: qp };
  }, [claims, memberClaims, ownedClaims]);

  if (!squad || squad.type !== 'squad') {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">Not found.</div>
        <h2 className="empty-state__title">Team not found</h2>
        <button className="btn-outline" onClick={() => navigate('/')}>Back to overview</button>
      </div>
    );
  }

  function personOpacity(personId: string): number {
    if (!hovered || hovered.type !== 'project') return 1;
    return (projectPeople.get(hovered.id)?.has(personId)) ? 1 : 0.4;
  }

  function projectOpacity(projectId: string): number {
    if (!hovered || hovered.type !== 'person') return 1;
    return (personProjects.get(hovered.id)?.has(projectId)) ? 1 : 0.4;
  }

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

        <div className="squad-detail-layout">
          {/* Column 1: People */}
          <div>
            <div className="dl-section__heading">
              PEOPLE · {String(memberClaims.length).padStart(2, '0')}
            </div>
            {membersByRole.length === 0 ? (
              <p className="dl-table__empty" style={{ marginTop: '0.875rem' }}>No members recorded yet.</p>
            ) : (
              membersByRole.map(({ role, items }) => (
                <div key={role} className="squad-role-group">
                  <div className="squad-card__section-label">{role}</div>
                  <ul className="squad-card__list">
                    {items.map(({ person, claim }) => (
                      <li
                        key={person.id}
                        className="squad-card__list-item"
                        style={{ opacity: personOpacity(person.id), transition: 'opacity 0.15s' }}
                        onMouseEnter={() => setHovered({ type: 'person', id: person.id })}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered({ type: 'person', id: person.id })}
                        onBlur={() => setHovered(null)}
                      >
                        <Avatar name={person.name} id={person.id} size="sm" />
                        <EntityLink entity={person} />
                        <StaleTag verified={claim.verified} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* Column 2: Projects */}
          <div>
            <div className="dl-section__heading">
              PROJECTS · {String(ownedProjects.length).padStart(2, '0')}
            </div>
            {ownedProjects.length === 0 ? (
              <p className="dl-table__empty" style={{ marginTop: '0.875rem' }}>No owned projects recorded yet.</p>
            ) : (
              <ul className="squad-card__list" style={{ marginTop: '0.875rem' }}>
                {ownedProjects.map(({ project, claim }) => (
                  <li
                    key={project.id}
                    className="squad-card__list-item"
                    style={{ opacity: projectOpacity(project.id), transition: 'opacity 0.15s' }}
                    onMouseEnter={() => setHovered({ type: 'project', id: project.id })}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered({ type: 'project', id: project.id })}
                    onBlur={() => setHovered(null)}
                  >
                    <span className="squad-card__chevron"><ChevronRight size={12} /></span>
                    <EntityLink entity={project} />
                    <StaleTag verified={claim.verified} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 3: Links */}
          <LinksSidebar links={links} entityId={squad.id} />
        </div>
      </div>
    </div>
  );
}
