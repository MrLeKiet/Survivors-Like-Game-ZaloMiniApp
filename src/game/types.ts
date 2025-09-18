export type XPOrb = {
    x: number;
    y: number;
    size: number;
    value: number;
    spawnDelay?: number; // frames until collectible
};
// Shared game types

export type Player = {
    x: number;
    y: number;
    size: number;
    speed: number;
    health: number;
    maxHealth: number;
    xp: number;
    level: number;
    xpToLevel: number;
    tripleBullet?: boolean;
    homingMissile?: boolean;
};

export type Enemy = {
    x: number;
    y: number;
    size: number;
    speed: number;
    health: number;
    maxHealth?: number;
    animFrame?: number;
};

export type Projectile = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    homing?: boolean;
    targetId?: number;
    orbitPhase?: number;
    aoe?: boolean;
    explodeFrame?: number;
};
