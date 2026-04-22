import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { parseEntities, parseClaims, exportEntities, exportClaims, downloadCsv } from '../utils/csv';
import { SAMPLE_ENTITIES_CSV, SAMPLE_CLAIMS_CSV } from '../sampleData';

export function ImportData() {
  const { entities, claims, setData, clearData, loadSample } = useData();
  const [entitiesCsv, setEntitiesCsv] = useState('');
  const [claimsCsv, setClaimsCsv] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const entitiesFileRef = useRef<HTMLInputElement>(null);
  const claimsFileRef = useRef<HTMLInputElement>(null);

  function handleFileLoad(
    e: ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setter((ev.target?.result as string) ?? '');
    reader.readAsText(file);
  }

  function handleImport(e: FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSuccess('');

    const allErrors: string[] = [];

    const parsedEntities = parseEntities(entitiesCsv);
    const parsedClaims = parseClaims(claimsCsv);

    allErrors.push(...parsedEntities.errors, ...parsedClaims.errors);

    if (parsedEntities.data.length === 0 && parsedClaims.data.length === 0) {
      setErrors(['Nothing to import — make sure both CSV fields are filled in.']);
      return;
    }

    setData(parsedEntities.data, parsedClaims.data);
    setSuccess(
      `Imported ${parsedEntities.data.length} entities and ${parsedClaims.data.length} claims.` +
        (allErrors.length ? ` ${allErrors.length} rows skipped.` : ''),
    );
    if (allErrors.length) setErrors(allErrors);
  }

  function handleLoadSample() {
    setEntitiesCsv(SAMPLE_ENTITIES_CSV);
    setClaimsCsv(SAMPLE_CLAIMS_CSV);
    setSuccess('');
    setErrors([]);
  }

  function handleClear() {
    clearData();
    setEntitiesCsv('');
    setClaimsCsv('');
    setSuccess('');
    setErrors([]);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Import / Export</h1>
        <p>Paste CSV content or load files. Data is saved to your browser's local storage.</p>
      </div>

      <form onSubmit={handleImport}>
        <div className="import-grid">
          <div>
            <div className="import-panel__label">
              entities.csv
              <button
                type="button"
                className="btn btn--secondary"
                style={{ fontSize: 11, padding: '0.2rem 0.5rem' }}
                onClick={() => entitiesFileRef.current?.click()}
              >
                Load file
              </button>
              <input
                ref={entitiesFileRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={e => handleFileLoad(e, setEntitiesCsv)}
              />
            </div>
            <div className="import-panel__hint">Columns: id, name, type, meta</div>
            <textarea
              className="csv-textarea"
              placeholder={`id,name,type,meta\nalice,Alice Müller,person,Engineering Manager\nteam-backend,Backend Team,squad,product\nproject-alpha,Project Alpha,project,ClientCo`}
              value={entitiesCsv}
              onChange={e => setEntitiesCsv(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div>
            <div className="import-panel__label">
              claims.csv
              <button
                type="button"
                className="btn btn--secondary"
                style={{ fontSize: 11, padding: '0.2rem 0.5rem' }}
                onClick={() => claimsFileRef.current?.click()}
              >
                Load file
              </button>
              <input
                ref={claimsFileRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={e => handleFileLoad(e, setClaimsCsv)}
              />
            </div>
            <div className="import-panel__hint">
              Columns: subject, relation, object, detail, source, verified
            </div>
            <textarea
              className="csv-textarea"
              placeholder={`subject,relation,object,detail,source,verified\nalice,member-of,team-backend,,Wiki,2026-04-01\nalice,works-on,project-alpha,TL,Wiki,2026-04-01`}
              value={claimsCsv}
              onChange={e => setClaimsCsv(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="import-actions">
          <button type="submit" className="btn btn--primary">
            Import
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleLoadSample}
          >
            Load sample data
          </button>
          {entities.length > 0 && (
            <>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => downloadCsv(exportEntities(entities), 'entities.csv')}
              >
                Export entities.csv
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => downloadCsv(exportClaims(claims), 'claims.csv')}
              >
                Export claims.csv
              </button>
              <button type="button" className="btn btn--danger" onClick={handleClear}>
                Clear all data
              </button>
            </>
          )}
        </div>
      </form>

      {success && <div className="import-success">✓ {success}</div>}
      {errors.length > 0 && (
        <div className="import-errors">
          <strong>Warnings / skipped rows:</strong>
          <ul>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {entities.length > 0 && (
        <div style={{ marginTop: '2rem', color: 'var(--muted)', fontSize: 13 }}>
          Currently loaded: {entities.length} entities · {claims.length} claims
        </div>
      )}
    </div>
  );
}
