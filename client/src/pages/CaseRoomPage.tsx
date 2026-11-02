import { useState } from 'react';
import { PublicCaseDto, HintTier, EvidenceType, RevealResultDto } from '@shared';
import { Lightbulb, Target, Clock, ChevronRight, Search, ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { EVIDENCE_TYPE_MAP } from '../lib/utils';
import Header from '../components/Header';
import EvidenceModal from '../components/EvidenceModal';
import SuspectModal from '../components/SuspectModal';
import HintModal from '../components/HintModal';
import { requestHintApi, submitAnswerApi } from '../lib/api';

type CaseRoomPageProps = {
  publicCase: PublicCaseDto;
  onUpdateCase: (updated: PublicCaseDto) => void;
  onReveal: (result: RevealResultDto) => void;
  onBack: () => void;
};

type ActiveTab = 'suspects' | 'evidence' | 'timeline';

export default function CaseRoomPage({ publicCase, onUpdateCase, onReveal, onBack }: CaseRoomPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('suspects');
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [accusedId, setAccusedId] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewingSuspect, setViewingSuspect] = useState<string | null>(null);
  const [reviewedEvidence, setReviewedEvidence] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hintLoading, setHintLoading] = useState(false);

  const suspectMap = Object.fromEntries(publicCase.suspects.map(s => [s.suspectId, s.name]));
  const evidenceObj = selectedEvidence ? publicCase.evidence.find(e => e.evidenceId === selectedEvidence) : null;
  const suspectObj = viewingSuspect ? publicCase.suspects.find(s => s.suspectId === viewingSuspect) : null;
  const accusedSuspect = accusedId ? publicCase.suspects.find(s => s.suspectId === accusedId) : null;

  function handleOpenEvidence(id: string) {
    setSelectedEvidence(id);
    setReviewedEvidence(prev => new Set(prev).add(id));
  }

  async function handleRequestHint(level: HintTier) {
    if (hintLoading) return;
    setHintLoading(true);
    try {
      const hint = await requestHintApi(publicCase.caseId, level);
      const exists = publicCase.unlockedHints.some(h => h.level === hint.level);
      const updated = exists ? publicCase.unlockedHints : [...publicCase.unlockedHints, hint];
      onUpdateCase({
        ...publicCase,
        unlockedHints: updated,
        remainingHints: hint.remainingHints
      });
    } catch (err: any) {
      console.error('Failed to unlock hint:', err);
    } finally {
      setHintLoading(false);
    }
  }

  async function handleSubmit() {
    if (!accusedId || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await submitAnswerApi(publicCase.caseId, {
        selectedSuspectId: accusedId
      });
      onReveal(result);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit accusation. Please try again.');
      setSubmitting(false);
    }
  }

  const TABS: Array<{ id: ActiveTab; label: string; count: number }> = [
    { id: 'suspects', label: 'Suspects', count: publicCase.suspects.length },
    { id: 'evidence', label: 'Evidence', count: publicCase.evidence.length },
    { id: 'timeline', label: 'Timeline', count: publicCase.timeline.length },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        phase="Case Room"
        onHome={onBack}
        rightSlot={
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ gap: '0.4rem', fontSize: '0.8rem' }}>
            <ArrowLeft size={14} /> New Case
          </button>
        }
      />

      {/* Case banner */}
      <div style={{ background: 'rgba(10,12,16,0.7)', borderBottom: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-crimson">🔍 Active Investigation</span>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Fictional Case</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', marginBottom: '0.5rem', lineHeight: 1.25 }}>{publicCase.title}</h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 600 }}>{publicCase.synopsis}</p>
            </div>
            {/* Action cluster */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowHints(true)} style={{ gap: '0.4rem' }}>
                <Lightbulb size={15} />
                Hints <span style={{ opacity: 0.6 }}>({publicCase.remainingHints} left)</span>
              </button>
              {accusedId && (
                <button className="btn btn-crimson" onClick={() => setShowConfirm(true)} style={{ gap: '0.4rem' }}>
                  <Target size={15} />
                  Submit Deduction
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main board */}
      <main style={{ flex: 1 }}>
        <div className="container" style={{ maxWidth: 1200, padding: '1.5rem' }}>

          {/* Error Banner */}
          {submitError && (
            <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', borderColor: 'var(--crimson)', background: 'rgba(225,29,72,0.1)', color: 'var(--crimson-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: '0.85rem' }}>{submitError}</span>
            </div>
          )}

          {/* Accused banner */}
          {accusedId && (
            <div className="animate-fadein card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', borderColor: 'var(--border-crimson)', background: 'rgba(225,29,72,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Your prime suspect: <strong style={{ color: 'var(--crimson-light)' }}>{accusedSuspect?.name}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>— Review the evidence before submitting.</span>
              </p>
              <button className="btn btn-crimson btn-sm" onClick={() => setShowConfirm(true)}>
                <Send size={13} /> Submit
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: '1.5rem' }}>
              {TABS.map(tab => (
                <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  {tab.label} <span style={{ opacity: 0.55, marginLeft: '0.3rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Suspects */}
            {activeTab === 'suspects' && (
              <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {publicCase.suspects.map(s => (
                  <div
                    key={s.suspectId}
                    className={`card card-clickable suspect-card${accusedId === s.suspectId ? ' card-active' : ''}`}
                    onClick={() => setViewingSuspect(s.suspectId)}
                    style={{ padding: '1.25rem', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      {/* Avatar */}
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(229,185,90,0.18), rgba(229,185,90,0.04))',
                        border: accusedId === s.suspectId ? '2px solid var(--gold)' : '1px solid var(--border-gold)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700
                      }}>
                        {s.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>{s.name}</h3>
                          {accusedId === s.suspectId && <span className="badge badge-crimson" style={{ fontSize: '0.6rem' }}>Accused</span>}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.65rem', opacity: 0.8 }}>{s.role}</p>
                        <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {s.profile}
                        </p>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={e => { e.stopPropagation(); setAccusedId(s.suspectId); }}
                          style={{ fontSize: '0.75rem', borderColor: accusedId === s.suspectId ? 'var(--border-crimson)' : undefined, color: accusedId === s.suspectId ? 'var(--crimson-light)' : undefined }}
                        >
                          {accusedId === s.suspectId ? '✓ Accused' : 'Accuse'}
                        </button>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        View profile <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Evidence */}
            {activeTab === 'evidence' && (
              <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
                {publicCase.evidence.map(ev => {
                  const typeInfo = EVIDENCE_TYPE_MAP[ev.type as EvidenceType] ?? EVIDENCE_TYPE_MAP['document'];
                  const IconComp = typeInfo.icon;
                  const reviewed = reviewedEvidence.has(ev.evidenceId);
                  return (
                    <div
                      key={ev.evidenceId}
                      className="card card-clickable"
                      onClick={() => handleOpenEvidence(ev.evidenceId)}
                      style={{ padding: '1.25rem', position: 'relative' }}
                    >
                      {!reviewed && (
                        <div style={{ position: 'absolute', top: '0.85rem', right: '0.85rem', width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 6px var(--gold)' }} />
                      )}
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <IconComp size={18} strokeWidth={1.5} style={{ color: typeInfo.colorClass === 'ev-messages' ? 'var(--emerald)' : typeInfo.colorClass === 'ev-cctv' ? 'var(--cyan)' : typeInfo.colorClass === 'ev-forensics' ? 'var(--orange)' : 'var(--violet)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span className={`badge ${typeInfo.badgeClass}`} style={{ fontSize: '0.62rem', marginBottom: '0.4rem' }}>{typeInfo.label}</span>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.35rem', lineHeight: 1.35 }}>{ev.title}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {ev.description}
                          </p>
                          {ev.inWorldTimestamp && (
                            <span className="tag" style={{ marginTop: '0.6rem' }}>
                              <Clock size={10} />{ev.inWorldTimestamp}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {ev.sourceLabel}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: reviewed ? 'var(--emerald)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {reviewed ? '✓ Reviewed' : <><Search size={11} /> Inspect</>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="stagger" style={{ position: 'relative' }}>
                {/* Vertical line */}
                <div style={{ position: 'absolute', left: '1.35rem', top: '0.5rem', bottom: '0.5rem', width: 2, background: 'linear-gradient(180deg, var(--border-gold) 0%, transparent 100%)', borderRadius: 1 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {publicCase.timeline.map((evt, idx) => (
                    <div key={evt.eventId} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', paddingLeft: '0.25rem' }}>
                      {/* Node */}
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--bg-surface)',
                        border: `2px solid ${idx === 0 ? 'var(--gold)' : 'var(--border-gold)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: idx === 0 ? 'var(--shadow-gold)' : undefined,
                        zIndex: 1
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: idx === 0 ? 'var(--gold)' : 'var(--gold-dim)' }} />
                      </div>
                      {/* Content */}
                      <div className="card" style={{ flex: 1, padding: '1rem 1.25rem', marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="tag"><Clock size={10} />{evt.timestamp}</span>
                          {evt.relatedSuspectIds.map(sid => (
                            <span key={sid} className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                              {suspectMap[sid] ?? sid}
                            </span>
                          ))}
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Solve CTA strip */}
          <div style={{ marginTop: '2.5rem', padding: '1.25rem 1.5rem', background: 'rgba(225,29,72,0.05)', border: '1px solid var(--border-crimson)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Ready to name the culprit?</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {accusedId
                  ? `You have accused ${accusedSuspect?.name}. Review all evidence before submitting.`
                  : 'Select a suspect from the Suspects tab, then submit your final deduction.'}
              </p>
            </div>
            <button
              className="btn btn-crimson"
              disabled={!accusedId || submitting}
              onClick={() => setShowConfirm(true)}
              style={{ flexShrink: 0 }}
            >
              <Target size={16} />
              {submitting ? 'Submitting…' : 'Submit Final Answer'}
            </button>
          </div>

          {/* Fiction notice */}
          <p style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2rem', lineHeight: 1.6 }}>
            Notice: All suspects, events, and evidence were AI-generated fiction for entertainment purposes only.
          </p>
        </div>
      </main>

      {/* Modals */}
      {evidenceObj && (
        <EvidenceModal
          evidence={evidenceObj}
          onClose={() => setSelectedEvidence(null)}
          suspectNames={suspectMap}
        />
      )}

      {suspectObj && (
        <SuspectModal
          suspect={suspectObj}
          onClose={() => setViewingSuspect(null)}
          onAccuse={id => setAccusedId(id)}
          disabled={publicCase.hasSubmitted}
        />
      )}

      {showHints && (
        <HintModal
          unlockedHints={publicCase.unlockedHints}
          remainingHints={publicCase.remainingHints}
          onRequestHint={handleRequestHint}
          onClose={() => setShowHints(false)}
          loading={hintLoading}
        />
      )}

      {/* Confirm submission modal */}
      {showConfirm && accusedSuspect && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && !submitting && setShowConfirm(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(225,29,72,0.1)', border: '1px solid var(--border-crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Target size={24} color="var(--crimson-light)" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Final Deduction</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                You are about to accuse <strong style={{ color: 'var(--text-primary)' }}>{accusedSuspect.name}</strong> as the culprit.
                This action is <strong>irreversible</strong> — choose carefully.
              </p>
              <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', borderColor: 'var(--border-crimson)', background: 'rgba(225,29,72,0.04)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <strong>{accusedSuspect.name}</strong> · {accusedSuspect.role}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-ghost" disabled={submitting} onClick={() => setShowConfirm(false)}>Go Back</button>
                <button className="btn btn-crimson" disabled={submitting} onClick={handleSubmit}>
                  <Send size={15} /> {submitting ? 'Verifying…' : 'Confirm Accusation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
