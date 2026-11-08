import { Art } from './Picture';

export function Star({ size = 24 }: { size?: number }) {
  return <Art slug="star" size={size} />;
}
