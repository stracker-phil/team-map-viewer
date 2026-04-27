import { Star } from 'lucide-react';
import { useStar } from '../context/StarContext';

interface Props {
  entityId: string;
  size?: 'sm' | 'lg';
  style?: React.CSSProperties;
}

export function StarButton({ entityId, size = 'sm', style }: Props) {
  const { isStarred, toggleStar } = useStar();
  const starred = isStarred(entityId);
  const iconSize = size === 'lg' ? 20 : 13;

  return (
    <button
      className={`star-btn star-btn--${size}${starred ? ' star-btn--starred' : ''}`}
      style={style}
      onClick={e => { e.stopPropagation(); toggleStar(entityId); }}
      aria-label={starred ? 'Unstar' : 'Star'}
      title={starred ? 'Unstar' : 'Star'}
    >
      <Star size={iconSize} fill={starred ? 'currentColor' : 'none'} />
    </button>
  );
}
