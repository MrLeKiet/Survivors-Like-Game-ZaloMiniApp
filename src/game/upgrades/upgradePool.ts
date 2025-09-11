// Upgrade pool for level-up rewards
export type Upgrade = {
    id: string;
    name: string;
    description: string;
    apply: (player: any) => void; // Replace 'any' with your Player type
};

export const UPGRADE_POOL: Upgrade[] = [
    {
        id: 'max-health',
        name: 'Max Health +20',
        description: 'Increase your max health by 20 and heal to full.',
        apply: (player) => {
            player.maxHealth += 20;
            player.health = player.maxHealth;
        },
    },
    {
        id: 'move-speed',
        name: 'Move Speed +20%',
        description: 'Increase your movement speed by 20%.',
        apply: (player) => {
            player.speed = (player.speed || 1) * 1.2;
        },
    },
    {
        id: 'projectile-size',
        name: 'Projectile Size +30%',
        description: 'Increase your projectile size by 30%.',
        apply: (player) => {
            player.projectileSize = (player.projectileSize || 12) * 1.3;
        },
    },
    {
        id: 'heal',
        name: 'Heal 50%',
        description: 'Restore 50% of your max health.',
        apply: (player) => {
            player.health = Math.min(player.maxHealth, player.health + player.maxHealth * 0.5);
        },
    },
    {
        id: 'attack-speed',
        name: 'Attack Speed +20%',
        description: 'Increase your attack speed by 20%.',
        apply: (player) => {
            player.attackSpeed = (player.attackSpeed || 1) * 1.2;
        },
    },
    {
        id: 'area',
        name: 'Area +25%',
        description: 'Increase the size of all your attacks/projectiles by 25%.',
        apply: (player) => {
            player.projectileSize = (player.projectileSize || 12) * 1.25;
        },
    },
    {
        id: 'xp-gain',
        name: 'XP Gain +20%',
        description: 'Gain 20% more XP from orbs.',
        apply: (player) => {
            player.xpGain = (player.xpGain || 1) * 1.2;
        },
    },
    {
        id: 'magnet',
        name: 'Pickup Range +50%',
        description: 'Increase the range at which you collect XP orbs by 50%.',
        apply: (player) => {
            player.pickupRange = (player.pickupRange || 100) * 1.5;
        },
    },
    {
        id: 'crit-chance',
        name: 'Critical Chance +10%',
        description: 'Gain a 10% chance to deal double damage.',
        apply: (player) => {
            player.critChance = (player.critChance || 0) + 0.10;
        },
    },
    {
        id: 'regen',
        name: 'Regenerate 1% HP/sec',
        description: 'Regenerate 1% of your max health every second.',
        apply: (player) => {
            player.regen = (player.regen || 0) + 0.01;
        },
    },
    {
        id: 'armor',
        name: 'Armor +1',
        description: 'Reduce all damage taken by 1.',
        apply: (player) => {
            player.armor = (player.armor || 0) + 1;
        },
    },
    {
        id: 'reroll',
        name: 'Reroll',
        description: 'Reroll your next level-up choices.',
        apply: (player) => {
            player.reroll = (player.reroll || 0) + 1;
        },
    },
    // Add more upgrades as desired
];
