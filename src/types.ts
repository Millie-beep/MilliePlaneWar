export enum GameState {
  START,
  PLAYING,
  PAUSED,
  GAME_OVER,
  WIN
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY'
}

export enum PowerUpType {
  TRIPLE_SHOT = 'TRIPLE_SHOT',
  SHIELD = 'SHIELD'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface GameStats {
  score: number;
  level: number;
  lives: number;
  enemiesKilled: number;
  powerUpsCollected: number;
  distanceTraveled: number;
}
