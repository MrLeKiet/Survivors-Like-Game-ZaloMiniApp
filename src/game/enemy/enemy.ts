import { Enemy } from '../types';

export function createEnemy(x: number, y: number): Enemy {
    return { x, y, size: 18, speed: 0.7, health: 3, maxHealth: 3 };
}
