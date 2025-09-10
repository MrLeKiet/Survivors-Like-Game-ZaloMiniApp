import { Player } from '../types';

export function movePlayer(player: Player, direction: { x: number; y: number }, viewport: { width: number; height: number }, bottomBlocker = 60): Player {
    let x = player.x + direction.x * player.speed;
    let y = player.y + direction.y * player.speed;
    x = Math.max(player.size, Math.min(viewport.width - player.size, x));
    y = Math.max(player.size, Math.min(viewport.height - bottomBlocker - player.size, y));
    return { ...player, x, y };
}
