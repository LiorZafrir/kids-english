import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '@/app/store';
import { DEFAULTS } from '@/config/app';
import { he } from '@/core/i18n/he';
import { hashPin, isValidPin, verifyPin } from '@/core/security/pin';
import { Button } from '@/ui/Button';
import { ParentDashboard } from './ParentDashboard';

/** PIN gate (client-side, fine for a family) in front of the parent dashboard. */
export function ParentGate() {
  const { settings, updateSettings } = useSession();
  const [pin, setPin] = useState('');
  const [wrong, setWrong] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const hasPin = !!settings.pinHash && !!settings.pinSalt;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidPin(pin, DEFAULTS.pinLength)) {
      setWrong(true);
      return;
    }
    if (!hasPin) {
      const { hash, salt } = await hashPin(pin);
      await updateSettings({ pinHash: hash, pinSalt: salt });
      setUnlocked(true);
    } else if (await verifyPin(pin, settings.pinHash!, settings.pinSalt!)) {
      setUnlocked(true);
    } else {
      setWrong(true);
      setPin('');
    }
  };

  return (
    <main className="page stack">
      <h1>{he.parent.title}</h1>
      {unlocked ? (
        <ParentDashboard />
      ) : (
        <form className="card stack" onSubmit={(e) => void submit(e)}>
          <div className="field">
            <label htmlFor="pin">{hasPin ? he.parent.enterPin : he.parent.setPin}</label>
            <input
              id="pin"
              className="input"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={DEFAULTS.pinLength}
              dir="ltr"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setWrong(false);
              }}
            />
            {wrong && (
              <span className="field-error" role="alert">
                {he.parent.wrongPin}
              </span>
            )}
          </div>
          <Button type="submit">{he.common.save}</Button>
        </form>
      )}
      <Link to="/">{he.common.back}</Link>
    </main>
  );
}
