import { PublicCaseDto, RevealResultDto } from '@shared';
import { CheckCircle, XCircle, RotateCcw, ChevronRight, Award, FileText } from 'lucide-react';
import Header from '../components/Header';

type ResultPageProps = {
  publicCase: PublicCaseDto;
  result: RevealResultDto;
  onNewCase: () => void;
  onReviewCase: () => void;
};

export default function ResultPage({ publicCase, result, onNewCase, onReviewCase }: ResultPageProps) {
  const isCorrect = result.isCorrect;
  const culpritName = result.solution.culpritName;
  const culprit = publicCase.suspects.find(s => s.suspectId === result.solution.culpritSuspectId);
  const accused = publicCase.suspects.find(s => s.suspectId === result.selectedSuspectId);
  const decisiveEvidence = publicCase.evidence.filter(e => result.solution.decisiveEvidenceIds.includes(e.evidenceId));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header phase="Verdict" onHome={onNewCase} />

      <main style={{ flex: 1, padding: '3rem 1.5rem' }}>
        <div className="container animate-fadeup" style={{ maxWidth: 720 }}>

          {/* Verdict card */}
          <div className={`card ${isCorrect ? 'verdict-correct' : 'verdict-incorrect'}`} style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(225,29,72,0.12)',
              border: `2px solid ${isCorrect ? 'var(--border-emerald)' : 'var(--border-crimson)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              {isCorrect
                ? <CheckCircle size={34} color="var(--emerald)" strokeWidth={1.5} />
                : <XCircle size={34} color="var(--crimson-light)" strokeWidth={1.5} />
              }
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <span className={`badge ${isCorrect ? 'badge-emerald' : 'badge-crimson'}`} style={{ fontSize: '0.72rem', marginBottom: '0.75rem', display: 'inline-flex' }}>
                {isCorrect ? <Award size={11} /> : <XCircle size={11} />}
                {isCorrect ? 'Case Closed' : 'Wrong Accusation'}
              </span>
            </div>

            <h1 className="gold-text" style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', marginBottom: '1rem', lineHeight: 1.2 }}>
              {isCorrect ? 'Outstanding Detective Work!' : 'Not Quite, Detective.'}
            </h1>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {isCorrect
                ? `Your deduction was correct. ${culpritName} was indeed the culprit — your analysis of the evidence led you to the truth.`
                : `You accused ${accused?.name || 'an innocent suspect'}, but the real culprit was ${culpritName}. The evidence, when examined carefully, points to a different conclusion.`}
            </p>

            {!isCorrect && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Your selection: <strong style={{ color: 'var(--text-primary)' }}>{accused?.name || 'Selected Suspect'}</strong>
              </p>
            )}
          </div>

          {/* Culprit reveal */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderColor: 'var(--border-gold)' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '1rem' }}>
              The Culprit
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(229,185,90,0.2), rgba(229,185,90,0.05))',
                border: '2px solid var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)', fontWeight: 700,
                boxShadow: 'var(--shadow-gold)'
              }}>
                {culpritName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{culpritName}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '0.85rem' }}>{culprit?.role || 'Perpetrator'}</p>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {[
                    { label: 'Motive', value: result.solution.motive },
                    { label: 'Method', value: result.solution.method },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-sm)', borderLeft: '2px solid var(--border-gold)' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{label}</p>
                      <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p className="label" style={{ marginBottom: '0.6rem' }}>How It Unfolded</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.solution.summary}</p>
          </div>

          {/* Decisive evidence */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p className="label" style={{ marginBottom: '0.85rem' }}>Decisive Evidence</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {decisiveEvidence.map(ev => (
                <div key={ev.evidenceId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 1rem', background: 'rgba(229,185,90,0.04)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-gold)' }}>
                  <FileText size={14} color="var(--gold)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>{ev.title}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alt eliminations */}
          {result.solution.alternativeEliminations.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <p className="label" style={{ marginBottom: '0.75rem' }}>Why the Others Were Cleared</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {result.solution.alternativeEliminations.map(ae => {
                  const sus = publicCase.suspects.find(s => s.suspectId === ae.suspectId);
                  return (
                    <div key={ae.suspectId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.025)', borderRadius: 'var(--r-sm)' }}>
                      <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.15rem', color: 'var(--text-secondary)' }}>{sus?.name || 'Suspect'}</p>
                        <p style={{ fontSize: '0.79rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{ae.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={onReviewCase} style={{ gap: '0.4rem' }}>
              <FileText size={15} /> Review Case File
            </button>
            <button className="btn btn-primary btn-lg" onClick={onNewCase} style={{ gap: '0.4rem' }}>
              <RotateCcw size={16} /> Solve Another Mystery
            </button>
          </div>

          {/* Fiction notice */}
          <p style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2rem', lineHeight: 1.6 }}>
            Notice: All suspects, events, and evidence were AI-generated fiction for entertainment purposes only.
          </p>
        </div>
      </main>
    </div>
  );
}
