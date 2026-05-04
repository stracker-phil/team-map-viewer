export interface FilterChipItem {
  value: string;
  label: string;
  count: number;
}

interface Props {
  items: FilterChipItem[];
  active: string | null;
  onChange: (value: string | null) => void;
  allLabel?: string;
  allCount: number;
}

export function FilterChips({ items, active, onChange, allLabel = 'ALL', allCount }: Props) {
  if (items.length === 0) return null;
  return (
    <div className='role-filters'>
      <button
        className={`role-filter-btn${active === null ? ' active' : ''}`}
        onClick={() => onChange(null)}
      >
        {allLabel} · {String(allCount).padStart(2, '0')}
      </button>
      {items.map(({ value, label, count }) => (
        <button
          key={value}
          className={`role-filter-btn${active === value ? ' active' : ''}`}
          onClick={() => onChange(active === value ? null : value)}
        >
          {label} · {String(count).padStart(2, '0')}
        </button>
      ))}
    </div>
  );
}
