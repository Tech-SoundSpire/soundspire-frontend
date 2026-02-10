declare module "music-genres" {
  export function getAllGenres(): Record<string, string[]>;
  export function getRandomGenre(): [string, string[]];
  export function getRandomSubgenre(): string;
}
