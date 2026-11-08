// Downloads the illustrations used by the app from Microsoft's Fluent Emoji set (MIT license,
// https://github.com/microsoft/fluentui-emoji) into public/art/. Run: npm run art
// Add an illustration by adding its Fluent name here, then reference it from src/art/art.ts.
import { mkdirSync, writeFileSync } from 'node:fs';

const NAMES = [
  // word pictures
  'Sun', 'Red apple', 'Tiger face', 'Pig face', 'Bug', 'Peanuts', 'Pushpin', 'Cooking',
  'Potable water', 'Ant', 'Cat face', 'Egg', 'Dog face', 'Top hat', 'Rat', 'Man', 'Chicken',
  'World map',
  // avatars
  'Fox', 'Owl', 'Bear', 'Rabbit face', 'Frog', 'Panda', 'Lion',
  // monsters
  'Alien monster', 'Ogre', 'Alien',
  // companion and what it wears
  'Hatching chick', 'Baby chick', 'Unicorn', 'Crown', 'Billed cap', 'Ribbon', 'Graduation cap',
  'Sunglasses', 'Scarf',
  // rewards, events, icons, flowers
  'Star', 'Glowing star', 'Snowflake', 'Cherry blossom', 'Maple leaf', 'Open book',
  'Repeat button', 'Joker', 'Seedling', 'Blossom', 'Sunflower', 'Tulip',
];

const REPO = 'microsoft/fluentui-emoji';
const slug = (name) => name.toLowerCase().replaceAll(' ', '-');

const tree = await (
  await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`)
).json();
const paths = new Set(tree.tree.map((t) => t.path));

mkdirSync('public/art', { recursive: true });
for (const name of NAMES) {
  const file = name.toLowerCase().replaceAll(' ', '_');
  const candidates = [
    `assets/${name}/3D/${file}_3d.png`,
    `assets/${name}/Default/3D/${file}_3d_default.png`, // people: default skin tone
  ];
  const path = candidates.find((p) => paths.has(p));
  if (!path) throw new Error(`Not found in Fluent Emoji: ${name}`);
  const res = await fetch(`https://raw.githubusercontent.com/${REPO}/main/${encodeURI(path)}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  // PNG signature check: never write anything that is not an image.
  if (!res.ok || bytes.subarray(1, 4).toString() !== 'PNG') throw new Error(`Bad file: ${name}`);
  writeFileSync(`public/art/${slug(name)}.png`, bytes);
  console.log('ok', slug(name), bytes.length);
}
