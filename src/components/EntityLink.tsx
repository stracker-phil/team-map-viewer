import { Link } from 'react-router-dom';
import { Entity } from '../types';

function routeFor(entity: Entity): string {
  switch (entity.type) {
    case 'person':  return `/person/${entity.id}`;
    case 'project': return `/project/${entity.id}`;
    case 'squad':   return `/squad/${entity.id}`;
  }
}

interface Props {
  entity: Entity;
  badge?: boolean;
}

export function EntityLink({ entity, badge }: Props) {
  const cls = badge
    ? `entity-badge entity-badge--${entity.type}`
    : `entity-link entity-link--${entity.type}`;

  return (
    <Link to={routeFor(entity)} className={cls}>
      {entity.name}
    </Link>
  );
}
