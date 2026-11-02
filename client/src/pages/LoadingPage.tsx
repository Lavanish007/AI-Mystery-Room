import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '../components/Header';

type LoadingPageProps = {
  premise: string;
  onComplete: (caseId: string) => void;
  onError: () => void;
  generateFn: (premise: string) => Promise<{ caseId: string }>;
};

const STEPS = [
  'Analysing your scenario…',
  'Profiling suspects and motives…',
  'Crafting evidence trail…',
  'Seeding timeline events…',
  'Preparing the case dossier…',
  'Validating the mystery…',
];

export default function LoadingPage({ premise, onComplete, onError, generateFn }: LoadingPageProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const total = 2400;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / (total / 60));
        return Math.min(next, 92);
      });
      setStepIdx(idx => (idx + 1) % STEPS.length);
    }, 400);

    generateFn(premise)
      .then(result => {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => onComplete(result.caseId), 300);
      })
      .catch(() => {
        clearInterval(interval);
        setHasError(true);
        onError();
      });

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="animate-fadeup" style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
          {/* Spinner */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))',
            border: '1px solid var(--border-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: 'var(--shadow-gold)',
            animation: 'pulse-gold 2s ease-in-out infinite'
          }}>
            <Loader2 size={32} color="var(--gold)" className="spin" strokeWidth={1.5} />
          </div>

          <h2 className="gold-text" style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
            Constructing Your Mystery
          </h2>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            {STEPS[stepIdx]}
          </p>

          {/* Progress bar */}
          <div className="progress-bar" style={{ marginBottom: '1rem', height: 4 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {Math.round(progress)}% complete
          </p>

          {/* Premise preview */}
          <div className="card" style={{ marginTop: '2.5rem', padding: '1.25rem', textAlign: 'left', borderStyle: 'dashed' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Your premise
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, fontStyle: 'italic' }}>
              "{premise.slice(0, 200)}{premise.length > 200 ? '…' : ''}"
            </p>
          </div>

          {hasError && (
            <div className="card" style={{ marginTop: '1.5rem', borderColor: 'var(--border-crimson)', background: 'rgba(225,29,72,0.06)' }}>
              <p style={{ color: 'var(--crimson-light)', fontSize: '0.9rem' }}>
                Generation failed. The AI service may be unavailable. Please try again.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
