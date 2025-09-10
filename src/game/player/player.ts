import { Player } from '../types';

export function createPlayer(x: number, y: number): Player {
    return {
        x,
        y,
        size: 6,
        speed: 3,
        health: 100,
        maxHealth: 100,
        xp: 0,
        level: 1,
        xpToLevel: 10
    };
}
