import { useRef } from 'react';
import { KbdChip } from './KbdChip';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function ListSearch({ value, onChange, placeholder = 'Filter by name…' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className='list-toolbar'>
      <div className='list-toolbar__input-wrap'>
        <input
          ref={inputRef}
          className='list-toolbar__search'
          type='text'
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <KbdChip
          label='⌘F'
          match={e => (e.metaKey || e.ctrlKey) && e.key === 'f'}
          onTrigger={() => { inputRef.current?.focus(); inputRef.current?.select(); }}
          preventDefault
        />
      </div>
    </div>
  );
}
