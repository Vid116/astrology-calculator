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

// Zodiac sign avatars for user profiles
export const ZODIAC_AVATARS = [
  { id: 'aries', name: 'Aries', path: '/signs/1.PNG' },
  { id: 'taurus', name: 'Taurus', path: '/signs/2.PNG' },
  { id: 'gemini', name: 'Gemini', path: '/signs/3.PNG' },
  { id: 'cancer', name: 'Cancer', path: '/signs/4.PNG' },
  { id: 'leo', name: 'Leo', path: '/signs/5.PNG' },
  { id: 'virgo', name: 'Virgo', path: '/signs/6.PNG' },
  { id: 'libra', name: 'Libra', path: '/signs/7.PNG' },
  { id: 'scorpio', name: 'Scorpio', path: '/signs/8.PNG' },
  { id: 'sagittarius', name: 'Sagittarius', path: '/signs/9.PNG' },
  { id: 'capricorn', name: 'Capricorn', path: '/signs/10.PNG' },
  { id: 'aquarius', name: 'Aquarius', path: '/signs/11.PNG' },
  { id: 'pisces', name: 'Pisces', path: '/signs/12.PNG' },
] as const;

// All avatars combined
export const ALL_AVATARS = [...PLANET_AVATARS, ...ZODIAC_AVATARS] as const;

export type PlanetAvatar = typeof PLANET_AVATARS[number];
export type ZodiacAvatar = typeof ZODIAC_AVATARS[number];
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

// Get sign image path by index (1-12) for Profection Wheel
export function getSignImagePath(signIndex: number): string {
  return `/signs/${signIndex}.PNG`;
}
