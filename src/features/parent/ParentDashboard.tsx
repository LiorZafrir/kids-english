import { useState, type FormEvent } from 'react';
import { useSession } from '@/app/store';
import { Avatar } from '@/art/Avatar';
import { LESSONS } from '@/content/phonics';
import { DEFAULTS } from '@/config/app';
import { he } from '@/core/i18n/he';
import { Ltr } from '@/core/i18n/Ltr';
import { accuracyOf } from '@/core/progress/adaptive';
import { secondsToday } from '@/core/progress/applySession';
import { goalProgress } from '@/core/progress/familyGoal';
import { hashPin, isValidPin } from '@/core/security/pin';
import { weakItems } from '@/core/srs/leitner';
import type { Profile } from '@/features/profiles/types';
import { Button } from '@/ui/Button';
import './parent.css';

const LIMITS = [10, 15, 20, 30, 45, 60];
const TARGETS = [20, 40, 60, 100];

function itemLabel(item: string): string {
  return item.slice(item.indexOf(':') + 1);
}

function ChildCard({ p }: { p: Profile }) {
  const { patchProfile, removeProfile } = useSession();
  const [confirm, setConfirm] = useState(false);
  const done = LESSONS.filter((l) => (p.progress[l.id] ?? 0) > 0).length;
  const acc = accuracyOf(p.recent);
  const weak = weakItems(p.srs);
  const minutes = Math.round(secondsToday(p, Date.now()) / 60);

  return (
    <section className="card stack child" aria-label={p.name}>
      <header className="child__head">
        <Avatar id={p.avatar} size={64} />
        <div>
          <h2>{p.name}</h2>
          <p className="muted">
            {p.grade === 'kg'
              ? he.profiles.gradeKg
              : p.grade === 2
                ? he.profiles.grade2
                : he.profiles.grade4}
          </p>
        </div>
      </header>
      <dl className="stats">
        <div>
          <dt>{he.profiles.stars}</dt>
          <dd>{p.stars}</dd>
        </div>
        <div>
          <dt>{he.parent.lessonsDone}</dt>
          <dd>
            {done}/{LESSONS.length}
          </dd>
        </div>
        <div>
          <dt>{he.parent.streak}</dt>
          <dd>{p.streak.current}</dd>
        </div>
        <div>
          <dt>{he.parent.accuracy}</dt>
          <dd>{acc === null ? '–' : `${Math.round(acc * 100)}%`}</dd>
        </div>
        <div>
          <dt>{he.parent.today}</dt>
          <dd>{he.parent.minutes(minutes)}</dd>
        </div>
        <div>
          <dt>{he.parent.battles}</dt>
          <dd>{p.battlesWon}</dd>
        </div>
      </dl>

      <div>
        <h3>{he.parent.weak}</h3>
        {weak.length === 0 ? (
          <p className="muted">{he.parent.noWeak}</p>
        ) : (
          <p className="weak">
            {weak.map((w) => (
              <Ltr key={w} as="span" className="weak__item">
                {itemLabel(w)}
              </Ltr>
            ))}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={`limit-${p.id}`}>{he.parent.dailyLimit}</label>
        <select
          id={`limit-${p.id}`}
          className="input"
          value={p.dailyLimitMin}
          onChange={(e) =>
            void patchProfile(p.id, (x) => ({ ...x, dailyLimitMin: Number(e.target.value) }))
          }
        >
          {(LIMITS.includes(p.dailyLimitMin) ? LIMITS : [...LIMITS, p.dailyLimitMin]).map((m) => (
            <option key={m} value={m}>
              {he.parent.minutes(m)}
            </option>
          ))}
        </select>
      </div>

      {confirm ? (
        <div className="row">
          <Button variant="danger" onClick={() => void removeProfile(p.id)}>
            {he.parent.confirmDelete}
          </Button>
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            {he.common.cancel}
          </Button>
        </div>
      ) : (
        <Button variant="ghost" onClick={() => setConfirm(true)}>
          {he.parent.deleteProfile}
        </Button>
      )}
    </section>
  );
}

function ChangePin() {
  const { updateSettings } = useSession();
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState<'ok' | 'bad' | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidPin(pin, DEFAULTS.pinLength)) {
      setMsg('bad');
      return;
    }
    const { hash, salt } = await hashPin(pin);
    await updateSettings({ pinHash: hash, pinSalt: salt });
    setPin('');
    setMsg('ok');
  };

  return (
    <form className="stack" onSubmit={(e) => void submit(e)}>
      <div className="field">
        <label htmlFor="newpin">{he.parent.changePin}</label>
        <input
          id="newpin"
          className="input"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          dir="ltr"
          maxLength={DEFAULTS.pinLength}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''));
            setMsg(null);
          }}
        />
        {msg === 'bad' && (
          <span className="field-error" role="alert">
            {he.parent.setPin}
          </span>
        )}
        {msg === 'ok' && <span role="status">{he.parent.pinChanged}</span>}
      </div>
      <Button type="submit" variant="secondary">
        {he.common.save}
      </Button>
    </form>
  );
}

export function ParentDashboard() {
  const { profiles, settings, updateSettings, mode, signOut } = useSession();
  const goal = settings.familyGoal;

  return (
    <div className="stack">
      {profiles.length === 0 && <p>{he.parent.noChildren}</p>}
      {profiles.map((p) => (
        <ChildCard key={p.id} p={p} />
      ))}

      <section className="card stack">
        <h2>{he.parent.family}</h2>
        <div className="field">
          <label htmlFor="goal">{he.parent.goalTarget}</label>
          <select
            id="goal"
            className="input"
            value={goal.target}
            onChange={(e) =>
              void updateSettings({ familyGoal: { ...goal, target: Number(e.target.value) } })
            }
          >
            {(TARGETS.includes(goal.target) ? TARGETS : [...TARGETS, goal.target]).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="muted">
            {he.goal.progress(Math.min(goalProgress(goal, profiles), goal.target), goal.target)}
          </span>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => void updateSettings({ highContrast: e.target.checked })}
          />
          {he.parent.highContrast}
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.muted}
            onChange={(e) => void updateSettings({ muted: e.target.checked })}
          />
          {he.parent.muted}
        </label>
        <ChangePin />
        {mode === 'firebase' && (
          <Button variant="secondary" onClick={() => void signOut()}>
            {he.auth.signOut}
          </Button>
        )}
      </section>

      <section className="card stack">
        <h2>{he.parent.audioTitle}</h2>
        <p className="muted">{he.parent.audioBody}</p>
      </section>
    </div>
  );
}
