import { Enemy } from '../types';

export function moveEnemies(enemies: Enemy[], player: { x: number; y: number }): Enemy[] {
    return enemies.map(e => {
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return e;
        return {
            ...e,
            x: e.x + (dx / dist) * e.speed,
            y: e.y + (dy / dist) * e.speed,
        };
    });
}
