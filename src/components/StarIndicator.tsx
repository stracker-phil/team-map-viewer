import { Star } from 'lucide-react';
import { useStar } from '../context/StarContext';

export function StarIndicator({ entityId }: { entityId: string }) {
  const { isStarred } = useStar();
  if (!isStarred(entityId)) return null;
  return (
    <span className='star-indicator' aria-label='Starred'>
      <Star size={11} fill='currentColor' />
    </span>
  );
}
