import { Projectile } from './types';

export function createProjectile(x: number, y: number, vx: number, vy: number): Projectile {
    return { x, y, vx, vy, size: 12 };
}

export function moveProjectiles(projectiles: Projectile[], viewport: { width: number; height: number }): Projectile[] {
    return projectiles
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy }))
        .filter(p => p.x > 0 && p.x < viewport.width && p.y > 0 && p.y < viewport.height);
}
