import { Suspect } from '@shared';
import { X, Clock, Shield } from 'lucide-react';

type SuspectModalProps = {
  suspect: Suspect;
  onClose: () => void;
  onAccuse: (id: string) => void;
  disabled?: boolean;
};

export default function SuspectModal({ suspect, onClose, onAccuse, disabled }: SuspectModalProps) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(229,185,90,0.15), rgba(229,185,90,0.05))', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700 }}>
                {suspect.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.15rem' }}>{suspect.name}</h3>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>{suspect.role}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            { label: 'Background', value: suspect.profile, border: 'var(--border-subtle)' },
            { label: 'Stated Motive', value: suspect.motive, border: 'var(--border-subtle)' },
            { label: 'Alibi / Statement', value: suspect.alibi, border: 'var(--border-cyan)' },
          ].map(({ label, value, border }) => (
            <div key={label}>
              <p className="label" style={{ marginBottom: '0.35rem' }}>{label}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.025)', borderRadius: 'var(--r-sm)', borderLeft: `2px solid ${border}` }}>
                {value}
              </p>
            </div>
          ))}
          <div>
            <p className="label" style={{ marginBottom: '0.35rem' }}>
              <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Public Timeline
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.025)', borderRadius: 'var(--r-sm)', borderLeft: '2px solid var(--border-gold)' }}>
              {suspect.publicTimeline}
            </p>
          </div>
        </div>

        <div style={{ padding: '1rem 1.75rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {!disabled && (
            <button className="btn btn-crimson" onClick={() => { onAccuse(suspect.suspectId); onClose(); }}>
              <Shield size={15} strokeWidth={2} />
              Accuse {suspect.name.split(' ')[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
