import { useEffect } from 'react';
import { moveEnemies } from '../enemy/moveEnemies';
import { movePlayer } from '../player/movePlayer';
import { moveProjectiles } from '../projectile/moveProjectiles';
import { Enemy, Player, Projectile, XPOrb } from '../types';

export function useGameLoop({
    player,
    setPlayer,
    playerRef,
    directionRef,
    enemies,
    setEnemies,
    enemiesRef,
    projectiles,
    setProjectiles,
    projectilesRef,
    xpOrbs,
    setXpOrbs,
    xpOrbsRef,
    gameOver,
    setGameOver,
    viewport
}: {
    player: Player,
    setPlayer: (p: Player) => void,
    playerRef: React.MutableRefObject<Player>,
    directionRef: React.MutableRefObject<{ x: number, y: number }>,
    enemies: Enemy[],
    setEnemies: (e: Enemy[]) => void,
    enemiesRef: React.MutableRefObject<Enemy[]>,
    projectiles: Projectile[],
    setProjectiles: (p: Projectile[]) => void,
    projectilesRef: React.MutableRefObject<Projectile[]>,
    xpOrbs: XPOrb[],
    setXpOrbs: React.Dispatch<React.SetStateAction<XPOrb[]>>,
    xpOrbsRef: React.MutableRefObject<XPOrb[]>,
    gameOver: boolean,
    setGameOver: (v: boolean) => void,
    viewport: { width: number, height: number }
}) {
    useEffect(() => {
        if (gameOver) return;
        let animationId: number;
        let lastShotTime = Date.now();
        const bottomBlocker = 60;
        playerRef.current = { ...player };
        enemiesRef.current = [...enemies];
        projectilesRef.current = [...projectiles];
        const update = () => {
            // Take a snapshot of all enemies at the start of the frame
            const originalEnemies = [...enemiesRef.current];
            playerRef.current = movePlayer(playerRef.current, directionRef.current, viewport, bottomBlocker);
            enemiesRef.current = moveEnemies(enemiesRef.current, playerRef.current);
            projectilesRef.current = moveProjectiles(projectilesRef.current, viewport);
            if (enemiesRef.current.length > 0 && Date.now() - lastShotTime > 500) {
                const nearest = enemiesRef.current.reduce((a, b) => {
                    const da = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                    const db = Math.hypot(playerRef.current.x - b.x, playerRef.current.y - b.y);
                    return da < db ? a : b;
                }, enemiesRef.current[0]);
                const dx = nearest.x - playerRef.current.x;
                const dy = nearest.y - playerRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    projectilesRef.current.push(
                        {
                            x: playerRef.current.x,
                            y: playerRef.current.y,
                            vx: (dx / dist) * 7,
                            vy: (dy / dist) * 7,
                            size: 12
                        }
                    );
                    lastShotTime = Date.now();
                }
            }
            // Remove enemies that hit the player and only deal damage once
            let playerHit = false;
            const survivedEnemies: Enemy[] = [];
            for (const e of enemiesRef.current) {
                const dx = playerRef.current.x - e.x;
                const dy = playerRef.current.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < playerRef.current.size + e.size) {
                    if (!playerHit) {
                        playerRef.current.health -= 20;
                        playerHit = true;
                    }
                } else {
                    survivedEnemies.push(e);
                }
            }
            enemiesRef.current = survivedEnemies;
            if (playerRef.current.health <= 0) {
                setGameOver(true);
                return;
            }
            // Check collision: projectile/enemy
            const hitEnemies = new Set<number>();
            const hitProjectiles = new Set<number>();
            originalEnemies.forEach((e, ei) => {
                projectilesRef.current.forEach((p, pi) => {
                    const dx = p.x - e.x;
                    const dy = p.y - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < p.size + e.size) {
                        hitEnemies.add(ei);
                        hitProjectiles.add(pi);
                    }
                });
            });
            // Drop XP orbs for killed enemies BEFORE removing them
            const newOrbs: XPOrb[] = [];
            originalEnemies.forEach((e, i) => {
                if (hitEnemies.has(i)) {
                    newOrbs.push({ x: e.x, y: e.y, size: 10, value: 1 });
                    console.debug('XP orb dropped at', e.x, e.y, 'for enemy', i);
                }
            });
            if (newOrbs.length > 0) {
                setXpOrbs(prev => [...prev, ...newOrbs]);
            }
            enemiesRef.current = enemiesRef.current.filter((_, i) => !hitEnemies.has(i));
            projectilesRef.current = projectilesRef.current.filter((_, i) => !hitProjectiles.has(i));
            // Collect XP orbs
            let collected = false;
            let xpGain = 0;
            const remainingOrbs = xpOrbsRef.current.filter(orb => {
                const dx = playerRef.current.x - orb.x;
                const dy = playerRef.current.y - orb.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < playerRef.current.size + orb.size) {
                    xpGain += orb.value;
                    collected = true;
                    return false;
                }
                return true;
            });
            setXpOrbs(remainingOrbs);
            if (xpGain > 0) {
                playerRef.current.xp += xpGain;
                // Level up logic
                while (playerRef.current.xp >= playerRef.current.xpToLevel) {
                    playerRef.current.xp -= playerRef.current.xpToLevel;
                    playerRef.current.level += 1;
                    playerRef.current.xpToLevel = Math.floor(playerRef.current.xpToLevel * 1.2) + 5;
                    // Optionally, increase player stats on level up
                    playerRef.current.maxHealth += 10;
                    playerRef.current.health = playerRef.current.maxHealth;
                }
            }
            setPlayer({ ...playerRef.current });
            setEnemies([...enemiesRef.current]);
            setProjectiles([...projectilesRef.current]);
            animationId = requestAnimationFrame(update);
        };
        
        animationId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationId);
    }, [gameOver, viewport]);
}
