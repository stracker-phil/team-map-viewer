import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { entityMap, filterClaims } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { StaleTag } from '../components/StaleTag';
import { Entity } from '../types';

export function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const { entities, claims } = useData();
  const map = entityMap(entities);
  const person = id ? map.get(id) : undefined;

  if (!person || person.type !== 'person') {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">❓</div>
        <h2 className="empty-state__title">Person not found</h2>
        <p>ID: {id}</p>
        <Link to="/" className="btn btn--secondary">Back to overview</Link>
      </div>
    );
  }

  const teamClaims = filterClaims(claims, { subject: person.id, relation: 'member-of' });
  const reportsClaims = filterClaims(claims, { subject: person.id, relation: 'reports-to' });
  const projectClaims = filterClaims(claims, { subject: person.id, relation: 'works-on' });
  const reporteesClaims = filterClaims(claims, { object: person.id, relation: 'reports-to' });

  const teams = resolve(teamClaims.map(c => c.object), map);
  const managers = resolve(reportsClaims.map(c => c.object), map);
  const projects = resolve(projectClaims.map(c => c.object), map);
  const reportees = resolve(reporteesClaims.map(c => c.subject), map);

  return (
    <div>
      <Link to="/" className="back-link">← Team Overview</Link>

      <div className="detail-header">
        <div className="detail-header__tag">
          <span className="entity-badge entity-badge--person">person</span>
        </div>
        <h1 className="detail-header__name">{person.name}</h1>
        {person.meta && (
          <div className="detail-header__meta">{person.meta}</div>
        )}
      </div>

      <div className="detail-layout">
        <aside>
          {teams.length > 0 && (
            <div className="detail-section">
              <div className="detail-section__title">Team{teams.length > 1 ? 's' : ''}</div>
              <ul className="detail-list">
                {teamClaims.map(c => {
                  const team = map.get(c.object);
                  if (!team) return null;
                  return (
                    <li key={c.object}>
                      <EntityLink entity={team} />
                      <StaleTag verified={c.verified} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {managers.length > 0 && (
            <div className="detail-section">
              <div className="detail-section__title">Reports to</div>
              <ul className="detail-list">
                {reportsClaims.map(c => {
                  const mgr = map.get(c.object);
                  if (!mgr) return null;
                  return (
                    <li key={c.object}>
                      <EntityLink entity={mgr} />
                      {c.detail && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{c.detail}</span>}
                      <StaleTag verified={c.verified} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {reportees.length > 0 && (
            <div className="detail-section">
              <div className="detail-section__title">Direct reports</div>
              <ul className="detail-list">
                {reporteesClaims.map(c => {
                  const rep = map.get(c.subject);
                  if (!rep) return null;
                  return (
                    <li key={c.subject}>
                      <EntityLink entity={rep} />
                      {c.detail && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{c.detail}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>

        <div>
          <div className="card">
            <div className="card__title">Projects</div>
            {projectClaims.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>No project assignments recorded.</p>
            ) : (
              projectClaims.map(c => {
                const proj = map.get(c.object);
                if (!proj) return null;
                return (
                  <div key={c.object} className="claim-row">
                    <span className="detail-role">{c.detail || '—'}</span>
                    <div className="claim-row__label">
                      <EntityLink entity={proj} />
                      {proj.meta && (
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{proj.meta}</span>
                      )}
                    </div>
                    <StaleTag verified={c.verified} always />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function resolve(ids: string[], map: Map<string, Entity>): Entity[] {
  return ids.map(id => map.get(id)).filter((e): e is Entity => !!e);
}
