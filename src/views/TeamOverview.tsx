import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { entityMap, byType, filterClaims } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { Entity, Claim } from '../types';

export function TeamOverview() {
  const { entities, claims } = useData();
  const squads = byType(entities, 'squad');
  const map = entityMap(entities);

  if (squads.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🗺</div>
        <h2 className="empty-state__title">No teams yet</h2>
        <p>Import your CSV files to see the team map.</p>
        <Link to="/import" className="btn btn--primary">Import data</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Team Overview</h1>
        <p>{squads.length} teams · {byType(entities, 'person').length} people · {byType(entities, 'project').length} projects</p>
      </div>

      <div className="team-grid">
        {squads.map(squad => (
          <TeamCard key={squad.id} squad={squad} claims={claims} entityMap={map} />
        ))}
      </div>
    </div>
  );
}

function TeamCard({
  squad,
  claims,
  entityMap: map,
}: {
  squad: Entity;
  claims: Claim[];
  entityMap: Map<string, Entity>;
}) {
  const memberClaims = filterClaims(claims, { relation: 'member-of', object: squad.id });
  const ownedClaims = filterClaims(claims, { relation: 'owned-by', object: squad.id });

  const members = memberClaims
    .map(c => map.get(c.subject))
    .filter((e): e is Entity => !!e);

  const projects = ownedClaims
    .map(c => map.get(c.subject))
    .filter((e): e is Entity => !!e);

  return (
    <div className="team-card" id={squad.id}>
      <div className="team-card__header">
        <Link to={`/squad/${squad.id}`} className="team-card__name">{squad.name}</Link>
        {squad.meta && <span className="team-card__type">{squad.meta}</span>}
      </div>

      {members.length > 0 && (
        <>
          <div className="team-section-label">Members</div>
          {members.map(m => (
            <div key={m.id} className="entity-row">
              <EntityLink entity={m} />
              {m.meta && <span className="meta">{m.meta}</span>}
            </div>
          ))}
        </>
      )}

      {projects.length > 0 && (
        <>
          <div className="team-section-label" style={{ marginTop: members.length > 0 ? undefined : 0 }}>
            Projects
          </div>
          {projects.map(p => (
            <div key={p.id} className="entity-row">
              <EntityLink entity={p} />
              {p.meta && <span className="meta">{p.meta}</span>}
            </div>
          ))}
        </>
      )}

      {members.length === 0 && projects.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>No claims recorded yet.</p>
      )}
    </div>
  );
}
