// --- Helper functions ---
import type { MutableRefObject } from 'react';
import { useEffect } from 'react';
import { moveEnemies } from '../enemy/moveEnemies';
import { movePlayer } from '../player/movePlayer';
import { moveProjectiles } from '../projectile/moveProjectiles';
import { Enemy, Player, Projectile, XPOrb } from '../types';

function handlePlayerEnemyCollision(playerRef: MutableRefObject<Player>, enemiesRef: MutableRefObject<Enemy[]>) {
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
    return playerRef.current.health <= 0;
}

function handleProjectileEnemyCollision(
    enemiesRef: MutableRefObject<Enemy[]>,
    projectilesRef: MutableRefObject<Projectile[]>,
    xpOrbsRef: MutableRefObject<XPOrb[]>
) {
    const newOrbs: XPOrb[] = [];
    const updatedEnemies: Enemy[] = [];
    const usedProjectiles = new Set<number>();
    enemiesRef.current.forEach((enemy, ei) => {
        let hit = false;
        for (let pi = 0; pi < projectilesRef.current.length; pi++) {
            if (usedProjectiles.has(pi)) continue;
            const p = projectilesRef.current[pi];
            const dx = p.x - enemy.x;
            const dy = p.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p.size + enemy.size) {
                hit = true;
                usedProjectiles.add(pi);
            }
        }
        if (hit) {
            enemy.health -= 1;
            if (enemy.health <= 0) {
                newOrbs.push({ x: enemy.x, y: enemy.y, size: 10, value: 1, spawnDelay: 30 }); // 30 frames delay
                //remove orbs after some time (handled in XP orb update)
                setTimeout(() => {
                    xpOrbsRef.current = xpOrbsRef.current.filter(orb => orb.x !== enemy.x || orb.y !== enemy.y);
                }, 30000); // 30 seconds
            } else {
                updatedEnemies.push(enemy);
            }
        } else {
            updatedEnemies.push(enemy);
        }
    });
    if (newOrbs.length > 0) {
        xpOrbsRef.current = [...xpOrbsRef.current, ...newOrbs];
    }
    enemiesRef.current = updatedEnemies;
    projectilesRef.current = projectilesRef.current.filter((_, i) => !usedProjectiles.has(i));
}

function handleXpOrbUpdate(
    playerRef: MutableRefObject<Player>,
    xpOrbsRef: MutableRefObject<XPOrb[]>,
    setPlayer: (p: Player) => void
) {
    let xpGain = 0;
    const updatedOrbs: XPOrb[] = [];
    xpOrbsRef.current.forEach(orb => {
        let orbDelay = orb.spawnDelay ?? 0;
        if (orbDelay > 0) {
            orbDelay--;
            updatedOrbs.push({ ...orb, spawnDelay: orbDelay });
        } else {
            const dx = playerRef.current.x - orb.x;
            const dy = playerRef.current.y - orb.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < playerRef.current.size + orb.size) {
                xpGain += orb.value;
            } else {
                updatedOrbs.push(orb);
            }
        }
    });
    xpOrbsRef.current = updatedOrbs;
    if (xpGain > 0) {
        playerRef.current.xp += xpGain;
        while (playerRef.current.xp >= playerRef.current.xpToLevel) {
            playerRef.current.xp -= playerRef.current.xpToLevel;
            playerRef.current.level += 1;
            playerRef.current.xpToLevel = Math.floor(playerRef.current.xpToLevel * 1.2) + 5;
            playerRef.current.maxHealth += 10;
            playerRef.current.health = playerRef.current.maxHealth;
        }
        setPlayer({ ...playerRef.current });
    }
}

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
        playerRef.current = { ...player };
        enemiesRef.current = [...enemies];
        projectilesRef.current = [...projectiles];
        const update = () => {
            // Movement
            playerRef.current = movePlayer(playerRef.current, directionRef.current, viewport);
            enemiesRef.current = moveEnemies(enemiesRef.current, playerRef.current);
            projectilesRef.current = moveProjectiles(projectilesRef.current, viewport);
            // Shooting
            if (enemiesRef.current.length > 0 && Date.now() - lastShotTime > 1000) {
                const nearest = enemiesRef.current.reduce((a, b) => {
                    const da = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                    const db = Math.hypot(playerRef.current.x - b.x, playerRef.current.y - b.y);
                    return da < db ? a : b;
                }, enemiesRef.current[0]);
                const dx = nearest.x - playerRef.current.x;
                const dy = nearest.y - playerRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    if (playerRef.current.tripleBullet) {
                        // Triple bullet: spread angles -15, 0, +15 degrees
                        const angle = Math.atan2(dy, dx);
                        const spread = 15 * Math.PI / 180;
                        const speed = 7;
                        for (let i = -1; i <= 1; i++) {
                            const a = angle + i * spread;
                            projectilesRef.current.push({
                                x: playerRef.current.x,
                                y: playerRef.current.y,
                                vx: Math.cos(a) * speed,
                                vy: Math.sin(a) * speed,
                                size: 12
                            });
                        }
                    } else {
                        projectilesRef.current.push({
                            x: playerRef.current.x,
                            y: playerRef.current.y,
                            vx: (dx / dist) * 7,
                            vy: (dy / dist) * 7,
                            size: 12
                        });
                    }
                    lastShotTime = Date.now();
                }
            }
            // Player/enemy collision
            if (handlePlayerEnemyCollision(playerRef, enemiesRef)) {
                setGameOver(true);
                return;
            }
            // Projectile/enemy collision and XP orb spawn
            handleProjectileEnemyCollision(enemiesRef, projectilesRef, xpOrbsRef);
            // XP orb update/collection
            handleXpOrbUpdate(playerRef, xpOrbsRef, setPlayer);
            // Sync XP orbs state for rendering
            setXpOrbs([...xpOrbsRef.current]);
            setPlayer({ ...playerRef.current });
            setEnemies([...enemiesRef.current]);
            setProjectiles([...projectilesRef.current]);
            animationId = requestAnimationFrame(update);
        };
        animationId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationId);
    }, [gameOver, viewport]);
}
