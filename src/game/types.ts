export type XPOrb = {
    x: number;
    y: number;
    size: number;
    value: number;
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
};

export type Enemy = {
    x: number;
    y: number;
    size: number;
    speed: number;
    health: number;
    maxHealth?: number;
};

export type Projectile = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
};
