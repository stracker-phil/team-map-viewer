import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  parseEntities,
  parseClaims,
  parseLinks,
  exportEntities,
  exportClaims,
  exportLinks,
  downloadCsv,
} from '../utils/csv';
import { SAMPLE_ENTITIES_CSV, SAMPLE_CLAIMS_CSV, SAMPLE_LINKS_CSV } from '../sampleData';

interface Props {
  onClose?: () => void;
}

export function ImportData({ onClose }: Props = {}) {
  const { entities, claims, links, setData, clearData } = useData();
  const [entitiesCsv, setEntitiesCsv] = useState('');
  const [claimsCsv, setClaimsCsv] = useState('');
  const [linksCsv, setLinksCsv] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const entitiesFileRef = useRef<HTMLInputElement>(null);
  const claimsFileRef = useRef<HTMLInputElement>(null);
  const linksFileRef = useRef<HTMLInputElement>(null);

  function handleFileLoad(e: ChangeEvent<HTMLInputElement>, setter: (v: string) => void) {
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
    const parsedLinks = linksCsv.trim() ? parseLinks(linksCsv) : { data: [], errors: [] };
    allErrors.push(...parsedEntities.errors, ...parsedClaims.errors, ...parsedLinks.errors);

    if (parsedEntities.data.length === 0 && parsedClaims.data.length === 0) {
      setErrors(['Nothing to import — make sure at least entities.csv and claims.csv are filled in.']);
      return;
    }

    setData(parsedEntities.data, parsedClaims.data, parsedLinks.data);
    setSuccess(
      `Imported ${parsedEntities.data.length} entities, ${parsedClaims.data.length} claims, and ${parsedLinks.data.length} links.` +
        (allErrors.length ? ` ${allErrors.length} rows skipped.` : ''),
    );
    if (allErrors.length) setErrors(allErrors);
    if (!allErrors.length && onClose) onClose();
  }

  function handleLoadSample() {
    setEntitiesCsv(SAMPLE_ENTITIES_CSV);
    setClaimsCsv(SAMPLE_CLAIMS_CSV);
    setLinksCsv(SAMPLE_LINKS_CSV);
    setSuccess('');
    setErrors([]);
  }

  function handleReset() {
    handleLoadSample();
    setData(
      parseEntities(SAMPLE_ENTITIES_CSV).data,
      parseClaims(SAMPLE_CLAIMS_CSV).data,
      parseLinks(SAMPLE_LINKS_CSV).data,
    );
    if (onClose) onClose();
  }

  function handleClear() {
    clearData();
    setEntitiesCsv('');
    setClaimsCsv('');
    setLinksCsv('');
    setSuccess('');
    setErrors([]);
  }

  const panels = (
    <div className="import-panels">
      <ImportPanel
        label="entities.csv"
        value={entitiesCsv}
        onChange={setEntitiesCsv}
        hint="Required columns: id, name, type, meta"
        fileRef={entitiesFileRef}
        onFile={e => handleFileLoad(e, setEntitiesCsv)}
      />
      <ImportPanel
        label="claims.csv"
        value={claimsCsv}
        onChange={setClaimsCsv}
        hint="Required columns: subject, relation, object, detail, source, verified"
        fileRef={claimsFileRef}
        onFile={e => handleFileLoad(e, setClaimsCsv)}
      />
      <ImportPanel
        label="links.csv"
        value={linksCsv}
        onChange={setLinksCsv}
        hint="Required columns: entity_id, type, url, label"
        fileRef={linksFileRef}
        onFile={e => handleFileLoad(e, setLinksCsv)}
      />
    </div>
  );

  if (onClose) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box modal-box--wide" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <div className="modal-title-eyebrow">DATA · IMPORT</div>
              <h2 className="modal-title">Paste or upload CSVs</h2>
              <p className="modal-subtitle">
                Paste fresh CSV content below, upload a file, or edit the current data inline.
              </p>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleImport}>
            <div className="modal-body">{panels}</div>

            {errors.length > 0 && (
              <div className="import-error" style={{ margin: '0 2rem 1rem' }}>
                {errors.map((err, i) => <div key={i}>{err}</div>)}
              </div>
            )}
            {success && (
              <div className="import-success" style={{ margin: '0 2rem 1rem' }}>{success}</div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={handleReset}>
                RESET TO SAMPLE DATA
              </button>
              <div className="modal-footer__actions">
                <button type="button" className="btn-outline" onClick={onClose}>CANCEL</button>
                <button type="submit" className="btn-primary">IMPORT & REPLACE</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="import-page__title">Import / Export</h1>
      <p className="import-page__subtitle">
        Paste CSV content or load files. Data is saved to your browser's local storage.
      </p>

      <form onSubmit={handleImport}>
        <div className="import-page__panels">{panels}</div>

        <div className="import-page__actions">
          <button type="submit" className="btn-primary">Import</button>
          <button type="button" className="btn-outline" onClick={handleLoadSample}>
            Load sample data
          </button>
          {entities.length > 0 && (
            <>
              <button
                type="button"
                className="btn-outline"
                onClick={() => downloadCsv(exportEntities(entities), 'entities.csv')}
              >
                Export entities.csv
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => downloadCsv(exportClaims(claims), 'claims.csv')}
              >
                Export claims.csv
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => downloadCsv(exportLinks(links), 'links.csv')}
              >
                Export links.csv
              </button>
              <button type="button" className="btn-danger" onClick={handleClear}>
                Clear all data
              </button>
            </>
          )}
        </div>
      </form>

      {success && <div className="import-success">{success}</div>}
      {errors.length > 0 && (
        <div className="import-error">
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}
    </div>
  );
}

function ImportPanel({
  label,
  value,
  onChange,
  hint,
  fileRef,
  onFile,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint: string;
  fileRef: React.RefObject<HTMLInputElement>;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <div className="import-panel__header">
        <span className="import-panel__label">{label.toUpperCase()}</span>
        <label className="import-panel__upload">
          <Upload size={11} />
          UPLOAD
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={onFile}
          />
        </label>
      </div>
      <textarea
        className="csv-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
      />
      <div className="import-panel__hint">{hint}</div>
    </div>
  );
}
