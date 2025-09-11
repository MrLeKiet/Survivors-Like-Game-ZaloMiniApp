import { Upgrade } from "./upgradePool";

export function getRandomUpgrades(pool: Upgrade[], count: number): Upgrade[] {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
