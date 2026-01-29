// Planet avatars for user profiles
export const PLANET_AVATARS = [
  { id: 'earth', name: 'Earth', path: '/assets/Earth.png' },
  { id: 'jupiter', name: 'Jupiter', path: '/assets/Jupiter.png' },
  { id: 'mars', name: 'Mars', path: '/assets/Mars.png' },
  { id: 'mercury', name: 'Mercury', path: '/assets/Mercury.png' },
  { id: 'neptune', name: 'Neptune', path: '/assets/Neptun.png' },
  { id: 'pluto', name: 'Pluto', path: '/assets/Pluto.png' },
  { id: 'saturn', name: 'Saturn', path: '/assets/SAturn.png' },
  { id: 'uranus', name: 'Uranus', path: '/assets/Uranus.png' },
  { id: 'venus', name: 'Venus', path: '/assets/Venus.png' },
] as const;

// Zodiac sign icon avatars (minimal SVG style)
export const ZODIAC_ICON_AVATARS = [
  { id: 'sign-icon-1', name: 'Sign 1', path: '/signs-svg/1.svg' },
  { id: 'sign-icon-2', name: 'Sign 2', path: '/signs-svg/2.svg' },
  { id: 'sign-icon-3', name: 'Sign 3', path: '/signs-svg/3.svg' },
  { id: 'sign-icon-4', name: 'Sign 4', path: '/signs-svg/4.svg' },
  { id: 'sign-icon-5', name: 'Sign 5', path: '/signs-svg/5.svg' },
  { id: 'sign-icon-6', name: 'Sign 6', path: '/signs-svg/6.svg' },
  { id: 'sign-icon-7', name: 'Sign 7', path: '/signs-svg/7.svg' },
  { id: 'sign-icon-8', name: 'Sign 8', path: '/signs-svg/8.svg' },
  { id: 'sign-icon-9', name: 'Sign 9', path: '/signs-svg/9.svg' },
  { id: 'sign-icon-10', name: 'Sign 10', path: '/signs-svg/10.svg' },
] as const;

// All avatars combined
export const ALL_AVATARS = [...PLANET_AVATARS, ...ZODIAC_ICON_AVATARS] as const;

export type PlanetAvatar = typeof PLANET_AVATARS[number];
export type ZodiacIconAvatar = typeof ZODIAC_ICON_AVATARS[number];
export type Avatar = typeof ALL_AVATARS[number];

// Get a random avatar path (from all avatars)
export function getRandomAvatarPath(): string {
  const randomIndex = Math.floor(Math.random() * ALL_AVATARS.length);
  return ALL_AVATARS[randomIndex].path;
}

// Check if a path is one of our avatars
export function isPlanetAvatar(path: string | null | undefined): boolean {
  if (!path) return false;
  return ALL_AVATARS.some(avatar => avatar.path === path);
}
