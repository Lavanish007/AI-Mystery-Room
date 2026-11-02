import { PublicEvidence } from '@shared';
import { EVIDENCE_TYPE_MAP, parseChatTranscript } from '../lib/utils';
import { X, Clock, User, AlertTriangle } from 'lucide-react';

type EvidenceModalProps = {
  evidence: PublicEvidence;
  onClose: () => void;
  suspectNames: Record<string, string>;
};

export default function EvidenceModal({ evidence, onClose, suspectNames }: EvidenceModalProps) {
  const typeInfo = EVIDENCE_TYPE_MAP[evidence.type] ?? EVIDENCE_TYPE_MAP['document'];
  const IconComp = typeInfo.icon;

  const iconColor = {
    'ev-messages': 'var(--emerald)',
    'ev-cctv': 'var(--cyan)',
    'ev-forensics': 'var(--orange)',
    'ev-document': 'var(--violet)',
  }[typeInfo.colorClass] ?? 'var(--gold)';

  function renderContent() {
    if (evidence.type === 'messages') {
      const bubbles = parseChatTranscript(evidence.content);
      return (
        <div className="chat-wrap" style={{ padding: '1rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--r-sm)' }}>
          {bubbles.map((b, i) => {
            const isSent = i % 2 === 0;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isSent ? 'flex-end' : 'flex-start' }}>
                {b.sender && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', padding: '0 0.25rem' }}>{b.sender}</span>}
                <div className={`chat-bubble ${isSent ? 'sent' : 'received'}`}>
                  {b.text}
                  {b.time && <div className="chat-meta">{b.time}</div>}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <div style={{
        background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-faint)', borderRadius: 'var(--r-sm)',
        padding: '1.25rem', fontFamily: evidence.type === 'forensics' || evidence.type === 'cctv' ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
      }}>
        {evidence.content}
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', flex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconComp size={20} strokeWidth={1.5} style={{ color: iconColor }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className={`badge ${typeInfo.badgeClass}`} style={{ fontSize: '0.65rem' }}>{typeInfo.label}</span>
                {evidence.inWorldTimestamp && <span className="tag"><Clock size={10} /> {evidence.inWorldTimestamp}</span>}
              </div>
              <h3 style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>{evidence.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Source: {evidence.sourceLabel}</p>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.025)', borderRadius: 'var(--r-sm)', borderLeft: '2px solid var(--border-gold)' }}>
            {evidence.description}
          </p>
          <div>
            <p className="label" style={{ marginBottom: '0.6rem' }}>Evidence Content</p>
            {renderContent()}
          </div>
          {evidence.relatedSuspectIds.length > 0 && (
            <div>
              <p className="label" style={{ marginBottom: '0.5rem' }}>Persons of Interest</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {evidence.relatedSuspectIds.map(sid => (
                  <span key={sid} className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                    <User size={10} />{suspectNames[sid] ?? sid}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-faint)' }}>
            <AlertTriangle size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              This evidence is AI-generated fiction. It does not represent any real event, person, or investigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
