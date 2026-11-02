import { HintTier } from '@shared';
import { Lightbulb, X, Lock } from 'lucide-react';

type HintModalProps = {
  unlockedHints: Array<{ hintId: string; level: HintTier; title: string; text: string }>;
  remainingHints: number;
  onRequestHint: (level: HintTier) => void;
  onClose: () => void;
  loading?: boolean;
};

const HINT_TIER_META: Record<number, { label: string; colorClass: string; desc: string }> = {
  1: { label: 'Gentle Nudge', colorClass: 'badge-emerald', desc: 'A subtle observation to sharpen your focus.' },
  2: { label: 'Key Lead',     colorClass: 'badge-gold',    desc: 'A meaningful clue pointing toward the truth.' },
  3: { label: 'Critical Insight', colorClass: 'badge-crimson', desc: 'A strong observation that narrows it significantly.' },
};

export default function HintModal({ unlockedHints, remainingHints, onRequestHint, onClose, loading }: HintModalProps) {
  const totalHints = 3;
  const unlockedLevels = new Set(unlockedHints.map(h => h.level));
  const nextLevel = ([1, 2, 3] as HintTier[]).find(l => !unlockedLevels.has(l));

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(229,185,90,0.1)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lightbulb size={18} color="var(--gold)" strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>Case Hints</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {remainingHints} of {totalHints} remaining — grounded in case evidence only
              </p>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {([1, 2, 3] as HintTier[]).map(level => {
            const meta = HINT_TIER_META[level];
            const unlocked = unlockedHints.find(h => h.level === level);
            const isNext = level === nextLevel;
            const isLocked = !unlocked && !isNext;

            return (
              <div key={level} className="card" style={{
                padding: '1.25rem',
                opacity: isLocked ? 0.4 : 1,
                border: unlocked ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                background: unlocked ? 'rgba(229,185,90,0.04)' : undefined,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span className={`badge ${meta.colorClass}`} style={{ fontSize: '0.65rem' }}>Hint {level}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{meta.label}</span>
                    </div>
                    {unlocked
                      ? <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{unlocked.text}</p>
                      : <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{isLocked ? '🔒 Unlock previous hints first.' : meta.desc}</p>
                    }
                  </div>
                  {isLocked && <Lock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 3 }} />}
                  {!unlocked && isNext && remainingHints > 0 && (
                    <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0, fontSize: '0.78rem' }} disabled={loading} onClick={() => onRequestHint(level)}>
                      {loading ? '…' : 'Reveal'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '0 1.75rem 1.5rem' }}>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            Hints are derived only from the generated case and will never directly reveal the culprit.
          </p>
        </div>
      </div>
    </div>
  );
}
