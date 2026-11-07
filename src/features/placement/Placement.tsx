import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/store';
import { applyPlacement } from '@/core/progress/placement';
import { he } from '@/core/i18n/he';
import { Button } from '@/ui/Button';
import { PLACEMENT_ITEMS, buildPlacement } from '@/features/lessons/buildLesson';
import { Runner, type RunResult } from '@/features/lessons/Runner';

/** Short reading check that sets where a Grade 2 or 4 child starts. Gives no stars. */
export function Placement() {
  const navigate = useNavigate();
  const { profiles, activeProfileId, patchProfile } = useSession();
  const profile = profiles.find((p) => p.id === activeProfileId);
  const steps = useMemo(() => buildPlacement(), []);
  const [result, setResult] = useState<{ u1: number; u2: number } | null>(null);

  if (!profile || profile.grade === 'kg') return <Navigate to="/home" replace />;

  if (result) {
    const advanced = result.u1 >= 4;
    return (
      <main className="page stack">
        <div className="card stack step">
          <h1>{he.placement.doneTitle}</h1>
          <p>{advanced ? he.placement.advanced : he.placement.fromStart}</p>
        </div>
        <Button big onClick={() => navigate('/home', { replace: true })}>
          {he.placement.go}
        </Button>
      </main>
    );
  }

  const finish = async (r: RunResult) => {
    const unitOf = new Map<string, number>(PLACEMENT_ITEMS.map((i) => [i.item, i.unit]));
    let u1 = 0;
    let u2 = 0;
    for (const x of r.results) {
      if (!x.firstTry) continue;
      if (unitOf.get(x.item) === 1) u1++;
      else u2++;
    }
    await patchProfile(profile.id, (p) => applyPlacement(p, u1, u2));
    setResult({ u1, u2 });
  };

  return <Runner steps={steps} onDone={(r) => void finish(r)} />;
}
