import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { entityMap, byType, filterClaims, personRoleMap } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { Avatar } from '../components/Avatar';
import { StaleTag } from '../components/StaleTag';
import { Entity, Claim } from '../types';

export function TeamOverview() {
  const { entities, claims } = useData();
  const squads = byType(entities, 'squad');
  const map = entityMap(entities);
  const navigate = useNavigate();

  if (squads.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">No squads yet.</div>
        <h2 className="empty-state__title">No teams yet</h2>
        <p>Import your CSV files to see the team map.</p>
        <button className="btn-primary" onClick={() => navigate('/import')}>Import data</button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-intro">
        <div className="section-intro__eyebrow">OVERVIEW</div>
        <h2 className="section-intro__title">Squads</h2>
      </div>

      <div className="squad-grid">
        {squads.map(squad => (
          <SquadCard key={squad.id} squad={squad} claims={claims} entityMap={map} />
        ))}
      </div>
    </div>
  );
}

function SquadCard({
  squad,
  claims,
  entityMap: map,
}: {
  squad: Entity;
  claims: Claim[];
  entityMap: Map<string, Entity>;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'people' | 'projects'>('people');

  const memberClaims = filterClaims(claims, { relation: 'member-of', object: squad.id });
  const ownedClaims = filterClaims(claims, { relation: 'owned-by', object: squad.id });

  const roleMap = useMemo(() => personRoleMap(claims), [claims]);

  const teamSize = useMemo(() => {
    const m: Record<string, number> = {};
    filterClaims(claims, { relation: 'works-on' }).forEach(c => {
      m[c.object] = (m[c.object] ?? 0) + 1;
    });
    return m;
  }, [claims]);

  const members = memberClaims
    .map(c => ({ person: map.get(c.subject), claim: c }))
    .filter((x): x is { person: Entity; claim: Claim } => !!x.person)
    .sort((a, b) => a.person.name.localeCompare(b.person.name));

  const projects = ownedClaims
    .map(c => ({ project: map.get(c.subject), claim: c }))
    .filter((x): x is { project: Entity; claim: Claim } => !!x.project && (teamSize[x.project.id] ?? 0) > 0)
    .sort((a, b) => a.project.name.localeCompare(b.project.name));

  return (
    <div className="squad-card">
      <div className="squad-card__header">
        <div>
          {squad.meta && (
            <div className="squad-card__eyebrow">{squad.meta}</div>
          )}
          <button
            className="squad-card__name"
            onClick={() => navigate(`/squad/${squad.id}`)}
          >
            {squad.name}
          </button>
        </div>
        <span className="squad-card__icon"><Boxes size={20} /></span>
      </div>

      <div className="squad-card__section">
        <div className="squad-tabs">
          <button
            className={`squad-tab${activeTab === 'people' ? ' active' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            PEOPLE · {String(members.length).padStart(2, '0')}
          </button>
          {projects.length > 0 && (
            <button
              className={`squad-tab${activeTab === 'projects' ? ' active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              PROJECTS · {String(projects.length).padStart(2, '0')}
            </button>
          )}
        </div>

        {activeTab === 'people' && (
          members.length === 0 ? (
            <div className="squad-card__empty">No members recorded yet.</div>
          ) : (
            <ul className="squad-card__list">
              {members.map(({ person, claim }) => (
                <li key={person.id} className="squad-card__list-item">
                  <Avatar name={person.name} id={person.id} size="sm" />
                  <EntityLink entity={person} />
                  {(roleMap.get(person.id) || person.meta) && (
                    <span className="squad-card__item-meta">{roleMap.get(person.id) || person.meta}</span>
                  )}
                  <StaleTag verified={claim.verified} />
                </li>
              ))}
            </ul>
          )
        )}

        {activeTab === 'projects' && (
          projects.length === 0 ? (
            <div className="squad-card__empty">No projects recorded yet.</div>
          ) : (
            <ul className="squad-card__list">
              {projects.map(({ project }) => (
                <li key={project.id} className="squad-card__list-item">
                  <span className="squad-card__chevron"><ChevronRight size={12} /></span>
                  <EntityLink entity={project} />
                  {project.meta && <span className="squad-card__item-meta">{project.meta}</span>}
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
