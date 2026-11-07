import type { ButtonHTMLAttributes } from 'react';
import './ui.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  big?: boolean;
}

export function Button({
  variant = 'primary',
  big = false,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = ['btn', variant !== 'primary' && `btn--${variant}`, big && 'btn--big', className]
    .filter(Boolean)
    .join(' ');
  return <button type={type} className={cls} {...rest} />;
}
