import { useEffect } from 'react';
import { Enemy, Player, Projectile, XPOrb } from '../types';

export function useGameDraw({
    player,
    enemies,
    projectiles,
    xpOrbs,
    gameOver,
    viewport,
    canvasRef
}: {
    player: Player,
    enemies: Enemy[],
    projectiles: Projectile[],
    xpOrbs: XPOrb[],
    gameOver: boolean,
    viewport: { width: number, height: number },
    canvasRef: React.RefObject<HTMLCanvasElement>
}) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, viewport.width, viewport.height);
        // Draw enemies
        enemies.forEach(e => {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size, 0, 2 * Math.PI);
            ctx.fillStyle = '#22d3ee';
            ctx.fill();
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        // Draw projectiles
        projectiles.forEach(p => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fffde4';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        });
        // Draw XP orbs (make them very visible)
        xpOrbs.forEach(orb => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.size + 4, 0, 2 * Math.PI);
            const grad = ctx.createRadialGradient(orb.x, orb.y, orb.size, orb.x, orb.y, orb.size + 4);
            grad.addColorStop(0, '#fffde4');
            grad.addColorStop(0.5, '#a3e635');
            grad.addColorStop(1, '#65a30d');
            ctx.fillStyle = grad;
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#facc15';
            ctx.stroke();
            ctx.restore();
        });
        // Draw player
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
        ctx.fillStyle = '#e11d48';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Draw health bar (always on top)
        const barWidth = Math.max(120, viewport.width * 0.3);
        const barHeight = 18;
        const barX = (viewport.width - barWidth) / 2;
        const barY = 16;
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(barX, barY, barWidth * (player.health / player.maxHealth), barHeight);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        ctx.restore();
        if (gameOver) {
            ctx.font = 'bold 32px sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', viewport.width / 2, viewport.height / 2);
        }
    }, [player, enemies, projectiles, gameOver, viewport, canvasRef]);
}
