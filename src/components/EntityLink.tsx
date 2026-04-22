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
  className?: string;
}

export function EntityLink({ entity, className }: Props) {
  return (
    <Link to={routeFor(entity)} className={`entity-link${className ? ` ${className}` : ''}`}>
      {entity.name}
    </Link>
  );
}
