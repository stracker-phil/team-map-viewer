import { useState } from 'react';
import { useData } from '../context/DataContext';
import { entityMap, byType, filterClaims } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { Entity } from '../types';
import { Link } from 'react-router-dom';

export function RoleList() {
  const { entities, claims } = useData();
  const persons = byType(entities, 'person');
  const map = entityMap(entities);

  const roles = [...new Set(persons.map(p => p.meta).filter(Boolean))].sort();
  const [selected, setSelected] = useState<string>(roles[0] ?? '');

  if (persons.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">👥</div>
        <h2 className="empty-state__title">No people yet</h2>
        <p>Import your CSV files to see roles.</p>
        <Link to="/import" className="btn btn--primary">Import data</Link>
      </div>
    );
  }

  const filtered = persons.filter(p => p.meta === selected);

  return (
    <div>
      <div className="page-header">
        <h1>Roles</h1>
        <p>Filter by role to see who does what</p>
      </div>

      <div className="role-filter">
        {roles.map(role => (
          <button
            key={role}
            className={`role-pill${selected === role ? ' active' : ''}`}
            onClick={() => setSelected(role)}
          >
            {role}
          </button>
        ))}
        <button
          className={`role-pill${selected === '' ? ' active' : ''}`}
          onClick={() => setSelected('')}
        >
          All
        </button>
      </div>

      <div className="person-grid">
        {(selected === '' ? persons : filtered).map(person => (
          <PersonCard key={person.id} person={person} entities={entities} claims={claims.filter(c => c.subject === person.id && c.relation === 'works-on')} entityMap={map} />
        ))}
      </div>
    </div>
  );
}

function PersonCard({
  person,
  entityMap: map,
  claims: worksOnClaims,
}: {
  person: Entity;
  entities: Entity[];
  claims: ReturnType<typeof filterClaims>;
  entityMap: Map<string, Entity>;
}) {
  const teamClaims = worksOnClaims;

  return (
    <div className="person-card">
      <div className="person-card__name">
        <EntityLink entity={person} />
      </div>
      {person.meta && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '0.6rem' }}>
          {person.meta}
        </div>
      )}
      {teamClaims.length > 0 && (
        <div className="person-projects">
          {teamClaims.map(c => {
            const proj = map.get(c.object);
            if (!proj) return null;
            return (
              <span key={c.object}>
                <EntityLink entity={proj} badge />
                {c.detail && (
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 2 }}>
                    {c.detail}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
