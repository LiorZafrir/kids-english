import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/app/store';
import { VILLAGE_FOLK, WORLDS, type WorldId } from '@/config/app';
import { Avatar } from '@/art/Avatar';
import { he } from '@/core/i18n/he';
import { Button } from '@/ui/Button';
import {
  AVATAR_IDS,
  MAX_NAME_LENGTH,
  createProfile,
  defaultWorldFor,
  validateName,
  type AvatarId,
  type Grade,
} from './types';
import './profiles.css';

const GRADES: { value: Grade; label: string }[] = [
  { value: 'kg', label: he.profiles.gradeKg },
  { value: 2, label: he.profiles.grade2 },
  { value: 4, label: he.profiles.grade4 },
];

const AVATAR_LABEL: Record<AvatarId, string> = {
  fox: 'שועל',
  owl: 'ינשוף',
  bear: 'דוב',
  bunny: 'ארנב',
  cat: 'חתול',
  frog: 'צפרדע',
  panda: 'פנדה',
  lion: 'אריה',
};

export function CreateProfile() {
  const { addProfile, selectProfile } = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<AvatarId>('fox');
  const [grade, setGrade] = useState<Grade>(2);
  const [world, setWorld] = useState<WorldId>(defaultWorldFor(2));
  const [touched, setTouched] = useState(false);

  const nameError = validateName(name);

  const pickGrade = (g: Grade) => {
    setGrade(g);
    setWorld(defaultWorldFor(g));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (nameError) return;
    const profile = createProfile({ name, avatar, grade, world });
    await addProfile(profile);
    selectProfile(profile.id);
    navigate('/home');
  };

  return (
    <main className="page">
      <form className="card stack" onSubmit={(e) => void submit(e)} noValidate>
        <h1>{he.profiles.newTitle}</h1>

        <div className="field">
          <label htmlFor="name">{he.profiles.name}</label>
          <input
            id="name"
            className="input"
            value={name}
            maxLength={MAX_NAME_LENGTH + 5}
            placeholder={he.profiles.namePlaceholder}
            aria-invalid={touched && !!nameError}
            aria-describedby={touched && nameError ? 'name-err' : undefined}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          {touched && nameError && (
            <span id="name-err" className="field-error" role="alert">
              {nameError === 'required' ? he.profiles.nameRequired : he.profiles.nameTooLong}
            </span>
          )}
        </div>

        <fieldset className="field">
          <legend>{he.profiles.grade}</legend>
          <div className="chip-row">
            {GRADES.map((g) => (
              <button
                key={String(g.value)}
                type="button"
                className="chip"
                aria-pressed={grade === g.value}
                onClick={() => pickGrade(g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>{he.profiles.chooseAvatar}</legend>
          <div className="chip-row">
            {AVATAR_IDS.map((a) => (
              <button
                key={a}
                type="button"
                className="chip chip--avatar"
                aria-pressed={avatar === a}
                aria-label={AVATAR_LABEL[a]}
                onClick={() => setAvatar(a)}
              >
                <Avatar id={a} size={56} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>{he.profiles.chooseWorld}</legend>
          <div className="chip-row">
            {(Object.keys(WORLDS) as WorldId[]).map((w) => (
              <button
                key={w}
                type="button"
                className="chip"
                aria-pressed={world === w}
                onClick={() => setWorld(w)}
              >
                {WORLDS[w].nameHe}
              </button>
            ))}
          </div>
        </fieldset>
        {world === 'garden' && <p className="banner">{VILLAGE_FOLK.nameHe}</p>}

        <div className="row">
          <Button type="submit">{he.profiles.create}</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            {he.common.cancel}
          </Button>
        </div>
      </form>
    </main>
  );
}
