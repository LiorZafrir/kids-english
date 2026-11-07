import { useState, type FormEvent } from 'react';
import { APP } from '@/config/app';
import { useSession } from '@/app/store';
import { he } from '@/core/i18n/he';
import { Button } from '@/ui/Button';

export function AuthScreen() {
  const { signIn, authError } = useSession();
  const [create, setCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void signIn(email, password, create);
  };

  return (
    <main className="page">
      <form className="card stack" onSubmit={submit}>
        <h1>
          {APP.nameHe} – {he.auth.title}
        </h1>
        <div className="field">
          <label htmlFor="email">{he.auth.email}</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            dir="ltr"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">{he.auth.password}</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete={create ? 'new-password' : 'current-password'}
            dir="ltr"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {authError && (
          <p className="field-error" role="alert">
            {he.auth.errors[authError] ?? he.auth.error}
            <span dir="ltr" className="sr-only">
              {authError}
            </span>
          </p>
        )}
        <Button type="submit">{create ? he.auth.signUp : he.auth.signIn}</Button>
        <Button variant="ghost" onClick={() => setCreate(!create)}>
          {create ? he.auth.switchToSignIn : he.auth.switchToSignUp}
        </Button>
      </form>
    </main>
  );
}
