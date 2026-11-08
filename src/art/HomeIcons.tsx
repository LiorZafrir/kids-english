import { Art } from './Picture';

/** Home-screen icons: one distinct picture per feature, so no two tiles look alike. */
export const StoryIcon = ({ size = 64 }: { size?: number }) => <Art slug="open-book" size={size} />;
export const ReviewIcon = ({ size = 64 }: { size?: number }) => (
  <Art slug="repeat-button" size={size} />
);
export const CardsIcon = ({ size = 64 }: { size?: number }) => <Art slug="joker" size={size} />;
export const WaterIcon = ({ size = 64 }: { size?: number }) => <Art slug="seedling" size={size} />;
