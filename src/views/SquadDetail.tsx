import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { entityMap, filterClaims } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { Entity, Claim } from '../types';

export function SquadDetail() {
  const { id } = useParams<{ id: string }>();
  const { entities, claims } = useData();
  const map = entityMap(entities);
  const squad = id ? map.get(id) : undefined;

  if (!squad || squad.type !== 'squad') {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">❓</div>
        <h2 className="empty-state__title">Team not found</h2>
        <Link to="/" className="btn btn--secondary">Back to overview</Link>
      </div>
    );
  }

  const memberClaims = filterClaims(claims, { relation: 'member-of', object: squad.id });
  const ownedClaims = filterClaims(claims, { relation: 'owned-by', object: squad.id });

  const members = memberClaims.map(c => map.get(c.subject)).filter((e): e is Entity => !!e);
  const projects = ownedClaims.map(c => map.get(c.subject)).filter((e): e is Entity => !!e);

  return (
    <div>
      <Link to="/" className="back-link">← Team Overview</Link>

      <div className="detail-header">
        <div className="detail-header__tag">
          <span className="entity-badge entity-badge--squad">squad</span>
        </div>
        <h1 className="detail-header__name">{squad.name}</h1>
        {squad.meta && <div className="detail-header__meta">{squad.meta}</div>}
      </div>

      <div className="detail-layout">
        <div>
          <div className="card">
            <div className="card__title">Members ({members.length})</div>
            {members.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>No members recorded.</p>
            ) : (
              memberClaims.map(c => {
                const person = map.get(c.subject);
                if (!person) return null;
                return <MemberRow key={c.subject} person={person} claim={c} entityMap={map} />;
              })
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card__title">Projects ({projects.length})</div>
            {projects.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>No projects recorded.</p>
            ) : (
              projects.map(proj => (
                <div key={proj.id} className="claim-row">
                  <div className="claim-row__label">
                    <EntityLink entity={proj} />
                    {proj.meta && (
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{proj.meta}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberRow({
  person,
  claim: _claim,
  entityMap: map,
}: {
  person: Entity;
  claim: Claim;
  entityMap: Map<string, Entity>;
}) {
  // Show person's projects within this context
  return (
    <div className="claim-row">
      <div className="claim-row__label">
        <EntityLink entity={person} />
        {person.meta && (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{person.meta}</span>
        )}
      </div>
    </div>
  );
}
