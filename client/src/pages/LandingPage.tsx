import { useState, useRef, useEffect } from 'react';
import { Sparkles, AlertCircle, ChevronDown } from 'lucide-react';
import Header from '../components/Header';

const MIN_CHARS = 30;
const MAX_CHARS = 1500;

type LandingPageProps = {
  onGenerate: (premise: string, settings: { genre: string; difficulty: string }) => void;
};

const GENRES = [
  'Contemporary Mystery',
  'Historical Detective',
  'Sci-Fi Thriller',
  'Gothic Horror',
  'Corporate Espionage',
  'Art & Heist',
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', desc: 'More clues, fewer red herrings' },
  { value: 'medium', label: 'Medium', desc: 'Balanced investigation' },
  { value: 'hard', label: 'Hard', desc: 'Scarce clues, many deceptions' },
];

const EXAMPLE_PREMISES = [
  "A renowned chef is found dead in his locked restaurant after the midnight service. The staff all have motives — rivalry, debt, and a stolen recipe. But only one of them truly did it.",
  "During a private art auction at a billionaire's penthouse, the star painting vanishes mid-event. Three guests had the access, the motive, and the opportunity.",
  "A tech CEO collapses at a product launch. The evidence points to a poisoning — but everyone in the boardroom stood to gain from her death.",
];

export default function LandingPage({ onGenerate }: LandingPageProps) {
  const [premise, setPremise] = useState('');
  const [genre, setGenre] = useState('Contemporary Mystery');
  const [difficulty, setDifficulty] = useState('medium');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const charCount = premise.trim().length;
  const charPct = Math.min(100, (charCount / MAX_CHARS) * 100);
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (charCount < MIN_CHARS) {
      setError(`Please write at least ${MIN_CHARS} characters (${MIN_CHARS - charCount} more needed).`);
      return;
    }
    if (charCount > MAX_CHARS) {
      setError(`Premise is too long — maximum ${MAX_CHARS.toLocaleString()} characters.`);
      return;
    }
    setError('');
    onGenerate(premise.trim(), { genre, difficulty });
  }

  function useExample(ex: string) {
    setPremise(ex);
    setError('');
    textareaRef.current?.focus();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero section */}
        <section style={{ padding: '4rem 1.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative glows */}
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(229,185,90,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="animate-fadeup container" style={{ maxWidth: 780, position: 'relative' }}>
            <div className="badge badge-crimson" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
              <Sparkles size={12} /> AI-Powered Fiction
            </div>

            <h1 className="gold-text" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Turn Any Scenario Into a<br />Solvable Mystery
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 2rem', lineHeight: 1.7 }}>
              Describe a situation. The AI generates a complete investigation: suspects with hidden motives,
              chat transcripts, forensic reports, CCTV logs, and one canonical truth.
            </p>

            {/* Stats strip */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
              {[
                ['3–5', 'Suspects'], ['6+', 'Evidence Items'], ['3', 'Progressive Hints'], ['1', 'Canonical Culprit']
              ].map(([num, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 700 }}>{num}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creation form */}
        <section style={{ padding: '0 1.5rem 6rem' }}>
          <div className="container animate-fadeup" style={{ maxWidth: 780, animationDelay: '120ms' }}>
            <form onSubmit={handleSubmit}>
              <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-dim)' }}>

                {/* Premise field */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label" htmlFor="premise">Your Mystery Scenario</label>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      ref={textareaRef}
                      id="premise"
                      className={`textarea${error ? ' error' : ''}`}
                      value={premise}
                      onChange={e => { setPremise(e.target.value); if (error) setError(''); }}
                      placeholder="Describe the scenario… e.g. 'A renowned sculptor is found dead in her locked studio. Three colleagues had access that night, and the missing masterpiece is worth millions.'"
                      style={{ minHeight: 150, fontSize: '0.975rem', lineHeight: 1.65, paddingBottom: '2.5rem' }}
                    />
                    {/* Char counter */}
                    <div style={{
                      position: 'absolute', bottom: '0.75rem', right: '0.85rem',
                      fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                      color: charCount > MAX_CHARS ? 'var(--crimson-light)' : charCount >= MIN_CHARS ? 'var(--emerald)' : 'var(--text-muted)'
                    }}>
                      {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                    <div className="progress-fill" style={{ width: `${charPct}%`, background: charCount > MAX_CHARS ? 'var(--crimson)' : charCount >= MIN_CHARS ? 'linear-gradient(90deg, var(--emerald), var(--gold))' : undefined }} />
                  </div>
                  {error && (
                    <p className="field-error">
                      <AlertCircle size={13} /> {error}
                    </p>
                  )}
                </div>

                {/* Example pills */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Try an example</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {EXAMPLE_PREMISES.map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => useExample(ex)}
                        className="btn-ghost btn btn-sm"
                        style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '0.82rem', padding: '0.55rem 0.85rem', height: 'auto', whiteSpace: 'normal', lineHeight: 1.4 }}
                      >
                        ↗ {ex.slice(0, 90)}…
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="divider" style={{ marginBottom: '1.5rem' }} />

                {/* Advanced options toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="btn btn-ghost btn-sm"
                  style={{ marginBottom: showAdvanced ? '1.25rem' : '0', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>

                {showAdvanced && (
                  <div className="animate-fadein" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {/* Genre */}
                    <div>
                      <label className="label" htmlFor="genre">Genre</label>
                      <div style={{ position: 'relative' }}>
                        <select id="genre" className="select" value={genre} onChange={e => setGenre(e.target.value)}>
                          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    {/* Difficulty */}
                    <div>
                      <label className="label">Difficulty</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {DIFFICULTIES.map(d => (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => setDifficulty(d.value)}
                            className={`btn btn-sm ${difficulty === d.value ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ flex: 1, flexDirection: 'column', gap: '0.1rem', height: 'auto', padding: '0.5rem 0.4rem' }}
                            title={d.desc}
                          >
                            <span style={{ fontWeight: 700 }}>{d.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: showAdvanced ? 0 : '0.5rem' }} disabled={charCount < MIN_CHARS || charCount > MAX_CHARS}>
                  <Sparkles size={18} strokeWidth={2} />
                  Generate My Mystery
                  <span style={{ fontSize: '0.8rem', opacity: 0.75, marginLeft: '0.25rem' }}>— powered by Gemini</span>
                </button>
              </div>
            </form>

            {/* Disclaimer */}
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.25rem', lineHeight: 1.6 }}>
              🔒 All scenarios, suspects, and evidence are AI-generated fiction for entertainment purposes only.
              No real people, events, or data are involved.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
