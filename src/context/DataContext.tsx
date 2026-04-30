import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Entity, Claim, AppData } from '../types';
import { parseTeamJson } from '../utils/csv';
import { SAMPLE_TEAM_JSON } from '../sampleData';

const STORAGE_KEY = 'team-map-v1';

interface DataContextValue {
	entities: Entity[];
	claims: Claim[];
	isDemo: boolean;
	setData: (entities: Entity[], claims: Claim[]) => void;
	clearData: () => void;
	loadSample: () => void;
	// derived — computed once, memoized
	entityMap: Map<string, Entity>;
	people: Entity[];
	squads: Entity[];
	projects: Entity[];
	repos: Entity[];
	teamSize: Map<string, number>;       // projectId → works-on count (project entities only)
	squadOf: Map<string, string>;        // projectId → squadId
	personRoleMap: Map<string, string>;  // personId → role title
	contributorCount: Map<string, number>; // repoId → contributes-to count
}

const DataContext = createContext<DataContextValue | null>(null);

function loadSampleData(): { entities: Entity[]; claims: Claim[] } {
	const { entities, claims } = parseTeamJson(SAMPLE_TEAM_JSON);
	return { entities, claims };
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

	const entityMap = useMemo(
		() => new Map(entities.map(e => [e.id, e])),
		[entities],
	);

	const { people, squads, projects, repos } = useMemo(() => {
		const seen = new Set<string>();
		const result = {
			people: [] as Entity[],
			squads: [] as Entity[],
			projects: [] as Entity[],
			repos: [] as Entity[],
		};
		for (const e of entities) {
			if (seen.has(e.id)) continue;
			seen.add(e.id);
			if (e.type === 'person') result.people.push(e);
			else if (e.type === 'squad') result.squads.push(e);
			else if (e.type === 'project') result.projects.push(e);
			else if (e.type === 'repo') result.repos.push(e);
		}
		return result;
	}, [entities]);

	const teamSize = useMemo(() => {
		const m = new Map<string, number>();
		claims.filter(c => c.relation === 'works-on').forEach(c => {
			if (entityMap.get(c.object)?.type !== 'project') return;
			m.set(c.object, (m.get(c.object) ?? 0) + 1);
		});
		return m;
	}, [claims, entityMap]);

	const squadOf = useMemo(() => {
		const m = new Map<string, string>();
		claims.filter(c => c.relation === 'owned-by').forEach(c => m.set(c.subject, c.object));
		return m;
	}, [claims]);

	const personRoleMap = useMemo(() => {
		const m = new Map<string, string>();
		claims.filter(c => c.relation === 'role').forEach(c => m.set(c.subject, c.object));
		return m;
	}, [claims]);

	const contributorCount = useMemo(() => {
		const m = new Map<string, number>();
		claims.filter(c => c.relation === 'contributes-to').forEach(c => {
			if (entityMap.get(c.object)?.type !== 'repo') return;
			m.set(c.object, (m.get(c.object) ?? 0) + 1);
		});
		return m;
	}, [claims, entityMap]);

	return (
		<DataContext.Provider
			value={{
				entities, claims, isDemo, setData, clearData, loadSample,
				entityMap, people, squads, projects, repos,
				teamSize, squadOf, personRoleMap, contributorCount,
			}}
		>
			{children}
		</DataContext.Provider>
	);
}

export function useData(): DataContextValue {
	const ctx = useContext(DataContext);
	if (!ctx) throw new Error('useData must be used within DataProvider');
	return ctx;
}
