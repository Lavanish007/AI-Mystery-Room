import { Compass } from 'lucide-react';

type HeaderProps = {
  phase?: string;
  onHome?: () => void;
  rightSlot?: React.ReactNode;
};

export default function Header({ phase = 'Phase 1: Prototype', onHome, rightSlot }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        {/* Logo */}
        <button
          onClick={onHome}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: onHome ? 'pointer' : 'default', padding: 0 }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--gold) 0%, #9a6f0e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-gold)'
          }}>
            <Compass size={18} color="#08090c" strokeWidth={2.5} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-primary)', lineHeight: 1 }}>
              AI MYSTERY ROOM
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Generative Investigation Engine
            </div>
          </div>
        </button>

        {/* Right Slot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {rightSlot}
          <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>{phase}</span>
        </div>
      </div>
    </header>
  );
}
