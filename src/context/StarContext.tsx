import React, { createContext, useContext, useState } from 'react';

const STARS_KEY = 'team-map-stars-v1';

interface StarContextValue {
  starred: ReadonlySet<string>;
  isStarred: (id: string) => boolean;
  toggleStar: (id: string) => void;
}

const StarContext = createContext<StarContextValue | null>(null);

export function StarProvider({ children }: { children: React.ReactNode }) {
  const [starred, setStarred] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STARS_KEY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  function toggleStar(id: string) {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STARS_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <StarContext.Provider value={{ starred, isStarred: id => starred.has(id), toggleStar }}>
      {children}
    </StarContext.Provider>
  );
}

export function useStar(): StarContextValue {
  const ctx = useContext(StarContext);
  if (!ctx) throw new Error('useStar must be used within StarProvider');
  return ctx;
}
