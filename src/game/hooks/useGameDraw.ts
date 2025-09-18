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
        // ...existing code...
        // Load enemy animation frames once
        const ENEMY_FRAMES = [
            'Wraith_01_Moving Forward_000.png',
            'Wraith_01_Moving Forward_001.png',
            'Wraith_01_Moving Forward_002.png',
            'Wraith_01_Moving Forward_003.png',
            'Wraith_01_Moving Forward_004.png',
            'Wraith_01_Moving Forward_005.png',
            'Wraith_01_Moving Forward_007.png',
            'Wraith_01_Moving Forward_008.png',
            'Wraith_01_Moving Forward_009.png',
            'Wraith_01_Moving Forward_010.png',
            'Wraith_01_Moving Forward_011.png',
        ];
        const ENEMY_IMG_PATH = '/src/game/enemy/img/';
        // Static cache for loaded images
        const winAny = window as any;
        if (!winAny._ENEMY_IMAGES) {
            winAny._ENEMY_IMAGES = ENEMY_FRAMES.map(name => {
                const img = new window.Image();
                img.src = ENEMY_IMG_PATH + name;
                return img;
            });
        }
        const enemyImages = winAny._ENEMY_IMAGES;
        // Draw enemies with animation
        enemies.forEach(e => {
            // Advance animation frame
            e.animFrame = (typeof e.animFrame === 'number' ? e.animFrame : Math.floor(Math.random() * ENEMY_FRAMES.length));
            e.animFrame = (e.animFrame + 1) % ENEMY_FRAMES.length;
            const img = enemyImages[e.animFrame];
            if (img?.complete) {
                ctx.save();
                // Increase image size by 1.5x
                const scale = 4;
                ctx.drawImage(img, e.x - e.size * scale, e.y - e.size * scale, e.size * 2 * scale, e.size * 2 * scale);
                ctx.restore();
            } else {
                // Fallback: draw circle if image not loaded
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.size, 0, 2 * Math.PI);
                ctx.fillStyle = '#22d3ee';
                ctx.fill();
                ctx.strokeStyle = '#0ea5e9';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
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
        // Draw player
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
        ctx.fillStyle = '#e11d48';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Draw XP orbs (production style)
        xpOrbs.forEach(orb => {
            ctx.save();
            ctx.beginPath();
            const orbRadius = orb.size + 2;
            ctx.arc(orb.x, orb.y, orbRadius, 0, 2 * Math.PI);
            ctx.fillStyle = '#22c55e'; // Solid green
            ctx.shadowColor = '#bbf7d0';
            ctx.shadowBlur = 24;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = (orb.spawnDelay ?? 0) > 0 ? '#dc2626' : '#16a34a';
            ctx.stroke();
            ctx.restore();
        });

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
