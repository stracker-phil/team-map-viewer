import React, { createContext, useContext, useState, useEffect } from 'react';
import { Entity, Claim, AppData } from '../types';
import { parseEntities, parseClaims } from '../utils/csv';
import { SAMPLE_ENTITIES_CSV, SAMPLE_CLAIMS_CSV } from '../sampleData';

const STORAGE_KEY = 'team-map-v1';

interface DataContextValue {
  entities: Entity[];
  claims: Claim[];
  isDemo: boolean;
  setData: (entities: Entity[], claims: Claim[]) => void;
  clearData: () => void;
  loadSample: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

function loadSampleData(): { entities: Entity[]; claims: Claim[] } {
  return {
    entities: parseEntities(SAMPLE_ENTITIES_CSV).data,
    claims: parseClaims(SAMPLE_CLAIMS_CSV).data,
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as AppData;
        setEntities(data.entities ?? []);
        setClaims(data.claims ?? []);
        setIsDemo(false);
      } catch {
        applyDemo();
      }
    } else {
      applyDemo();
    }
  }, []);

  function applyDemo() {
    const sample = loadSampleData();
    setEntities(sample.entities);
    setClaims(sample.claims);
    setIsDemo(true);
  }

  function setData(newEntities: Entity[], newClaims: Claim[]) {
    setEntities(newEntities);
    setClaims(newClaims);
    setIsDemo(false);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ entities: newEntities, claims: newClaims }),
    );
  }

  function clearData() {
    setEntities([]);
    setClaims([]);
    setIsDemo(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  function loadSample() {
    applyDemo();
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <DataContext.Provider value={{ entities, claims, isDemo, setData, clearData, loadSample }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
