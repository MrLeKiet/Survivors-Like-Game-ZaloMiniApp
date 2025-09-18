// Centralized enemy spawn interval (ms)
export const ENEMY_SPAWN_INTERVAL = 50;
import { Enemy } from '../types';

export function createEnemy(x: number, y: number): Enemy {
    return { x, y, size: 18, speed: 0.7, health: 1, maxHealth: 1 };
}
