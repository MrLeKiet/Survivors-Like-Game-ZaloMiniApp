// Shared game types

export type Player = {
    x: number;
    y: number;
    size: number;
    speed: number;
};

export type Enemy = {
    x: number;
    y: number;
    size: number;
    speed: number;
};

export type Projectile = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
};
