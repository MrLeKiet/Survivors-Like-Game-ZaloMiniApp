// Upgrade pool for level-up rewards
export type Upgrade = {
    id: string;
    name: string;
    description: string;
    apply: (player: any) => void; // Replace 'any' with your Player type
};

export const UPGRADE_POOL: Upgrade[] = [
    {
        id: 'triple-bullet',
        name: 'Triple Bullet',
        description: 'Shoot three projectiles in a spread.',
        apply: (player) => {
            player.tripleBullet = true;
        },
    },
    {
        id: 'homing-missile',
        name: 'Homing Missile',
        description: 'Launch a missile that follows the nearest enemy and explodes for AOE damage.',
        apply: (player) => {
            player.homingMissile = true;
        },
    },
];
