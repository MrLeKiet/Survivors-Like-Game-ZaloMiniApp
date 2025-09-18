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
        description: 'Shoot three projectiles in a spread (upside-down triangle).',
        apply: (player) => {
            player.tripleBullet = true;
        },
    },
];
