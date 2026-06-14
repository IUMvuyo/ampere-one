'use client';
import { useState, useEffect } from 'react';
import { AI_KEY_LS, AI_MODEL_LS, DEFAULT_AI_MODEL, getStoredAiKey, getStoredAiModel } from '@/lib/coach';

const MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (fast, cheap)' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (smart)' },
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 (best)' },
];

// Bring-your-own-key control for the AI coach. Key lives only in the browser.
export default function AiKeyButton({ onChange }) {
  const [open, setOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [key, setKey] = useState('');
  const [model, setModel] = useState(DEFAULT_AI_MODEL);

  useEffect(() => { setHasKey(!!getStoredAiKey()); setModel(getStoredAiModel()); }, []);

  const save = () => {
    if (key.trim()) window.localStorage.setItem(AI_KEY_LS, key.trim());
    window.localStorage.setItem(AI_MODEL_LS, model);
    setHasKey(!!getStoredAiKey());
    setKey('');
    setOpen(false);
    onChange && onChange();
  };
  const clear = () => {
    window.localStorage.removeItem(AI_KEY_LS);
    setHasKey(false);
    setOpen(false);
    onChange && onChange();
  };

  return (
    <span style={{ position: 'relative' }}>
      <button className="btn ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setOpen((o) => !o)}>
        {hasKey ? '🔑 Your AI key ✓' : '🔑 Use your AI'}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '120%', right: 0, width: 300, background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 12, padding: 14, zIndex: 40, boxShadow: '0 20px 40px -16px rgba(0,0,0,0.6)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Bring your own Claude key</div>
          <div className="muted" style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.4 }}>
            Stored only in this browser, sent only to Anthropic — never to our servers. Get one at{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>console.anthropic.com</a>.
          </div>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-api03-…" style={{ fontSize: 12, marginBottom: 8 }} />
          <select value={model} onChange={(e) => setModel(e.target.value)} style={{ fontSize: 12, marginBottom: 10 }}>
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <button className="btn primary" style={{ padding: '7px 14px', fontSize: 12 }} onClick={save}>Save</button>
            {hasKey && <button className="btn ghost" style={{ padding: '7px 14px', fontSize: 12 }} onClick={clear}>Remove</button>}
          </div>
        </div>
      )}
    </span>
  );
}
