import { useState } from 'react';
import { PublicCaseDto, RevealResultDto } from '@shared';
import { createCaseApi } from './lib/api';
import LandingPage from './pages/LandingPage';
import LoadingPage from './pages/LoadingPage';
import CaseRoomPage from './pages/CaseRoomPage';
import ResultPage from './pages/ResultPage';

type Route =
  | { view: 'landing' }
  | { view: 'loading'; premise: string; settings: { genre: string; difficulty: string } }
  | { view: 'case'; caseId: string }
  | { view: 'result'; caseId: string; result: RevealResultDto };

export default function App() {
  const [route, setRoute] = useState<Route>({ view: 'landing' });
  const [caseStore, setCaseStore] = useState<Record<string, PublicCaseDto>>({});
  const [lastResult, setLastResult] = useState<Record<string, RevealResultDto>>({});

  function handleGenerate(premise: string, settings: { genre: string; difficulty: string }) {
    setRoute({ view: 'loading', premise, settings });
  }

  function handleCaseUpdate(updated: PublicCaseDto) {
    setCaseStore(prev => ({ ...prev, [updated.caseId]: updated }));
  }

  if (route.view === 'landing') {
    return <LandingPage onGenerate={handleGenerate} />;
  }

  if (route.view === 'loading') {
    const { premise, settings } = route;
    return (
      <LoadingPage
        premise={premise}
        onComplete={caseId => setRoute({ view: 'case', caseId })}
        onError={() => setRoute({ view: 'landing' })}
        generateFn={async (p) => {
          const publicCase = await createCaseApi({
            premise: p,
            settings: {
              genre: settings.genre,
              difficulty: settings.difficulty as any
            }
          });
          setCaseStore(prev => ({ ...prev, [publicCase.caseId]: publicCase }));
          return { caseId: publicCase.caseId };
        }}
      />
    );
  }

  if (route.view === 'case') {
    const publicCase = caseStore[route.caseId];
    if (!publicCase) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Case not found.</div>;
    return (
      <CaseRoomPage
        publicCase={publicCase}
        onUpdateCase={handleCaseUpdate}
        onReveal={(result) => {
          setLastResult(prev => ({ ...prev, [route.caseId]: result }));
          setRoute({ view: 'result', caseId: route.caseId, result });
        }}
        onBack={() => setRoute({ view: 'landing' })}
      />
    );
  }

  if (route.view === 'result') {
    const publicCase = caseStore[route.caseId];
    const result = route.result || lastResult[route.caseId];
    if (!publicCase || !result) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Verdict not found.</div>;
    return (
      <ResultPage
        publicCase={publicCase}
        result={result}
        onNewCase={() => setRoute({ view: 'landing' })}
        onReviewCase={() => setRoute({ view: 'case', caseId: route.caseId })}
      />
    );
  }

  return null;
}
