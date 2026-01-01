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

export type PlanetAvatar = typeof PLANET_AVATARS[number];

// Get a random planet avatar path
export function getRandomAvatarPath(): string {
  const randomIndex = Math.floor(Math.random() * PLANET_AVATARS.length);
  return PLANET_AVATARS[randomIndex].path;
}

// Check if a path is one of our planet avatars
export function isPlanetAvatar(path: string | null | undefined): boolean {
  if (!path) return false;
  return PLANET_AVATARS.some(avatar => avatar.path === path);
}
