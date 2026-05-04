import { useEffect, useRef } from 'react';

interface Props {
  label: string;
  match: (e: KeyboardEvent) => boolean;
  onTrigger: () => void;
  preventDefault?: boolean;
}

export function KbdChip({ label, match, onTrigger, preventDefault = false }: Props) {
  const matchRef = useRef(match);
  const onTriggerRef = useRef(onTrigger);
  const preventDefaultRef = useRef(preventDefault);
  matchRef.current = match;
  onTriggerRef.current = onTrigger;
  preventDefaultRef.current = preventDefault;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (matchRef.current(e)) {
        if (preventDefaultRef.current) e.preventDefault();
        onTriggerRef.current();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return <span className='kbd-chip'>{label}</span>;
}
