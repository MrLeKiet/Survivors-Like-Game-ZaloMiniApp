import { Enemy, Projectile } from '../types';

export function moveHomingMissiles(projectiles: Projectile[], enemies: Enemy[], viewport: { width: number; height: number }): Projectile[] {
    return projectiles
        .map(p => {
            if (p.homing && enemies.length > 0) {
                // Find nearest enemy
                let nearest = enemies[0];
                let minDist = Math.hypot(p.x - nearest.x, p.y - nearest.y);
                for (const e of enemies) {
                    const d = Math.hypot(p.x - e.x, p.y - e.y);
                    if (d < minDist) {
                        minDist = d;
                        nearest = e;
                    }
                }
                // Orbit phase: circle the enemy for a few frames
                const orbitFrames = 30; // frames to orbit
                const orbitRadius = 40;
                let orbitPhase = p.orbitPhase ?? 0;
                if (orbitPhase < orbitFrames) {
                    // Cursed spiral: add noise and spiral radius
                    const baseAngle = (orbitPhase / orbitFrames) * 2 * Math.PI * 2; // 2 full circles
                    // Add some random noise to the angle for a chaotic effect
                    const noise = Math.sin(orbitPhase * 0.7) * 0.7 + Math.cos(orbitPhase * 1.3) * 0.4;
                    const angle = baseAngle + noise;
                    // Spiral radius shrinks as it approaches the end
                    const spiralRadius = orbitRadius * (1 - orbitPhase / orbitFrames) + 10;
                    const ox = nearest.x + Math.cos(angle) * spiralRadius;
                    const oy = nearest.y + Math.sin(angle) * spiralRadius;
                    const speed = 8;
                    const dx = ox - p.x;
                    const dy = oy - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        return {
                            ...p,
                            vx: (dx / dist) * speed,
                            vy: (dy / dist) * speed,
                            x: p.x + (dx / dist) * speed,
                            y: p.y + (dy / dist) * speed,
                            orbitPhase: orbitPhase + 1,
                            targetId: enemies.indexOf(nearest)
                        };
                    }
                } else {
                    // After orbiting, target directly
                    const dx = nearest.x - p.x;
                    const dy = nearest.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        const speed = 10;
                        return {
                            ...p,
                            vx: (dx / dist) * speed,
                            vy: (dy / dist) * speed,
                            x: p.x + (dx / dist) * speed,
                            y: p.y + (dy / dist) * speed,
                            orbitPhase: orbitPhase + 1,
                            targetId: enemies.indexOf(nearest)
                        };
                    }
                }
            }
            return { ...p, x: p.x + p.vx, y: p.y + p.vy };
        })
        .filter(p => p.x > 0 && p.x < viewport.width && p.y > 0 && p.y < viewport.height);
}
