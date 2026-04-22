import { useNavigate } from 'react-router-dom';
import { Boxes, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { entityMap, byType, filterClaims } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { Avatar } from '../components/Avatar';
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
  const memberClaims = filterClaims(claims, { relation: 'member-of', object: squad.id });
  const ownedClaims = filterClaims(claims, { relation: 'owned-by', object: squad.id });

  const members = memberClaims
    .map(c => map.get(c.subject))
    .filter((e): e is Entity => !!e);

  const projects = ownedClaims
    .map(c => map.get(c.subject))
    .filter((e): e is Entity => !!e);

  const isSupport = squad.meta === 'support';
  const listItems = isSupport ? members : projects;
  const sectionLabel = isSupport ? 'MEMBERS' : 'PROJECTS';

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
        <div className="squad-card__section-label">
          {sectionLabel} · {String(listItems.length).padStart(2, '0')}
        </div>

        {listItems.length === 0 ? (
          <div className="squad-card__empty">None recorded yet.</div>
        ) : (
          <ul className="squad-card__list">
            {listItems.map(item => (
              <li key={item.id} className="squad-card__list-item">
                {item.type === 'person'
                  ? <Avatar name={item.name} id={item.id} size="sm" />
                  : <span className="squad-card__chevron"><ChevronRight size={12} /></span>
                }
                <EntityLink entity={item} />
                {item.meta && (
                  <span className="squad-card__item-meta">{item.meta}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isSupport && members.length > 0 && (
        <div className="squad-card__section">
          <div className="squad-card__section-label">
            MEMBERS · {String(members.length).padStart(2, '0')}
          </div>
          <ul className="squad-card__list">
            {members.map(m => (
              <li key={m.id} className="squad-card__list-item">
                <Avatar name={m.name} id={m.id} size="sm" />
                <EntityLink entity={m} />
                {m.meta && (
                  <span className="squad-card__item-meta">{m.meta}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
