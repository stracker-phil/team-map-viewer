import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';
import { parseTeamJson, exportTeamJson } from '../utils/csv';
import { SAMPLE_TEAM_JSON } from '../sampleData';

interface Props {
  onClose?: () => void;
}

export function ImportData({ onClose }: Props = {}) {
  const { entities, claims, config, setData, clearData, isDemo } = useData();
  const [json, setJson] = useState(() => isDemo ? '' : exportTeamJson(entities, claims, config));
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileLoad(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setJson((ev.target?.result as string) ?? '');
    reader.readAsText(file);
  }

  function handleImport(e: FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSuccess('');

    const { entities: newEntities, claims: newClaims, config: newConfig, errors: parseErrors } = parseTeamJson(json);

    if (newEntities.length === 0 && newClaims.length === 0) {
      setErrors(['Nothing to import — paste or upload a team.json file.']);
      return;
    }

    setData(newEntities, newClaims, newConfig);
    setSuccess(
      `Imported ${newEntities.length} entities and ${newClaims.length} claims.` +
      (parseErrors.length ? ` ${parseErrors.length} rows skipped.` : ''),
    );
    if (parseErrors.length) setErrors(parseErrors);
    if (!parseErrors.length && onClose) onClose();
  }

  function handleLoadSample() {
    setJson(SAMPLE_TEAM_JSON);
    setSuccess('');
    setErrors([]);
  }

  function handleReset() {
    const { entities: newEntities, claims: newClaims, config: newConfig } = parseTeamJson(SAMPLE_TEAM_JSON);
    setData(newEntities, newClaims, newConfig);
    setJson(SAMPLE_TEAM_JSON);
    if (onClose) onClose();
  }

  function handleClear() {
    clearData();
    setJson('');
    setSuccess('');
    setErrors([]);
  }

  const panel = (
    <div>
      <div className='import-panel__header'>
        <span className='import-panel__label'>TEAM.JSON</span>
        <label className='import-panel__upload'>
          <Upload size={11} />
          UPLOAD
          <input
            ref={fileRef}
            type='file'
            accept='.json,application/json'
            style={{ display: 'none' }}
            onChange={handleFileLoad}
          />
        </label>
      </div>
      <textarea
        className='csv-textarea'
        value={json}
        onChange={e => setJson(e.target.value)}
        spellCheck={false}
      />
      <div className='import-panel__hint'>
        JSON with <code>entities</code> and <code>claims</code> arrays — paste content or upload a file
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div className='overlay overlay--center modal-overlay' onClick={onClose}>
        <div className='overlay__box overlay__box--wide modal-box' onClick={e => e.stopPropagation()}>
          <div className='modal-shell__header modal-header'>
            <div>
              <div className='modal-title-eyebrow'>DATA · IMPORT</div>
              <h2 className='modal-title'>Paste or upload team.json</h2>
              <p className='modal-subtitle'>
                Paste JSON content below, upload a file, or edit the current data inline.
              </p>
            </div>
            <button className='modal-shell__close modal-close' onClick={onClose} aria-label='Close'>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleImport}>
            <div className='modal-shell__body'>{panel}</div>

            {errors.length > 0 && (
              <div className='import-error' style={{ margin: '0 2rem 1rem' }}>
                {errors.map((err, i) => <div key={i}>{err}</div>)}
              </div>
            )}
            {success && (
              <div className='import-success' style={{ margin: '0 2rem 1rem' }}>{success}</div>
            )}

            <div className='modal-shell__footer'>
              <button type='button' className='btn-ghost' onClick={handleReset}>
                RESET TO SAMPLE DATA
              </button>
              <div className='modal-footer__actions'>
                <button type='button' className='btn-outline' onClick={onClose}>CANCEL</button>
                <button type='submit' className='btn-primary'>IMPORT & REPLACE</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className='import-page__title'>Import</h1>
      <p className='import-page__subtitle'>
        Paste JSON content or load a file. Data is saved to your browser's local storage.
      </p>

      <form onSubmit={handleImport}>
        <div style={{ marginBottom: '1.5rem' }}>{panel}</div>

        <div className='import-page__actions'>
          <button type='submit' className='btn-primary'>Import</button>
          <button type='button' className='btn-outline' onClick={handleLoadSample}>
            Load sample data
          </button>
          {entities.length > 0 && (
            <button type='button' className='btn-danger' onClick={handleClear}>
              Clear all data
            </button>
          )}
        </div>
      </form>

      {success && <div className='import-success'>{success}</div>}
      {errors.length > 0 && (
        <div className='import-error'>
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}
    </div>
  );
}
