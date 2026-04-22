import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { byType } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { Avatar } from '../components/Avatar';
import { Entity } from '../types';

export function RoleList() {
  const { entities } = useData();
  const navigate = useNavigate();
  const people = byType(entities, 'person');

  const allRoles = useMemo(() => {
    const counts = new Map<string, number>();
    people.forEach(p => {
      if (!p.meta) return;
      counts.set(p.meta, (counts.get(p.meta) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [people]);

  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const shown = roleFilter ? people.filter(p => p.meta === roleFilter) : people;
    const m = new Map<string, Entity[]>();
    shown.forEach(p => {
      const r = p.meta || 'Other';
      if (!m.has(r)) m.set(r, []);
      m.get(r)!.push(p);
    });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [people, roleFilter]);

  if (people.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">No people yet.</div>
        <h2 className="empty-state__title">No people yet</h2>
        <p>Import your CSV files to see the roster.</p>
        <button className="btn-primary" onClick={() => navigate('/import')}>Import data</button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-intro">
        <div className="section-intro__eyebrow">ROSTER</div>
        <h2 className="section-intro__title">People</h2>
      </div>

      <div className="role-filters">
        <button
          className={`role-filter-btn${roleFilter === null ? ' active' : ''}`}
          onClick={() => setRoleFilter(null)}
        >
          ALL · {String(people.length).padStart(2, '0')}
        </button>
        {allRoles.map(([role, count]) => (
          <button
            key={role}
            className={`role-filter-btn${roleFilter === role ? ' active' : ''}`}
            onClick={() => setRoleFilter(roleFilter === role ? null : role)}
          >
            {role.toUpperCase()} · {String(count).padStart(2, '0')}
          </button>
        ))}
      </div>

      <div>
        {grouped.map(([role, list]) => (
          <div key={role} className="role-group">
            <div className="role-group__header">
              <h3 className="role-group__title">{role}</h3>
              <span className="role-group__meta">
                {role.toUpperCase()} · {String(list.length).padStart(2, '0')}
              </span>
            </div>
            <ul className="role-group__list">
              {list.map(p => (
                <li key={p.id} className="role-group__list-item">
                  <Avatar name={p.name} id={p.id} size="sm" />
                  <EntityLink entity={p} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
