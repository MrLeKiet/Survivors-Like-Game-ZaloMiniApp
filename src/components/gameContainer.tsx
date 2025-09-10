import React, { useRef, useState } from "react";
import { createEnemy, moveEnemies } from "../game/enemy";
import { useKeyboardMovement, useTouchMovement } from '../game/input';
import { createPlayer, movePlayer } from "../game/player";
import { createProjectile, moveProjectiles } from "../game/projectile";
import { Enemy, Player, Projectile } from "../game/types";
import { useViewport } from '../game/useViewport';

const GameContainer: React.FC = () => {
    const viewport = useViewport();
    const [player, setPlayer] = useState<Player>(createPlayer(window.innerWidth / 2, window.innerHeight / 2));
    const playerRef = useRef<Player>(player);
    const [direction, setDirection] = useState({ x: 0, y: 0 });
    const directionRef = useRef({ x: 0, y: 0 });
    const [enemies, setEnemies] = useState<Enemy[]>([
        createEnemy(50, 50),
        createEnemy(window.innerWidth - 50, 100),
    ]);
    const enemiesRef = useRef<Enemy[]>(enemies);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const projectilesRef = useRef<Projectile[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Sync refs
    React.useEffect(() => { playerRef.current = player; }, [player]);
    React.useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
    React.useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);
    React.useEffect(() => { directionRef.current = direction; }, [direction]);

    useKeyboardMovement(setDirection);
    useTouchMovement(setDirection);

    // Auto-spawn enemies at the border every 2 seconds
    React.useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            const border = Math.floor(Math.random() * 4);
            let x = 0, y = 0;
            if (border === 0) { // top
                x = Math.random() * viewport.width;
                y = -18;
            } else if (border === 1) { // bottom
                x = Math.random() * viewport.width;
                y = viewport.height + 18;
            } else if (border === 2) { // left
                x = -18;
                y = Math.random() * viewport.height;
            } else { // right
                x = viewport.width + 18;
                y = Math.random() * viewport.height;
            }
            setEnemies(prev => [...prev, createEnemy(x, y)]);
        }, 2000);
        return () => clearInterval(interval);
    }, [gameOver, viewport]);

    // Main game loop
    React.useEffect(() => {
        if (gameOver) return;
        let animationId: number;
        let lastShotTime = Date.now();
        const bottomBlocker = 60;
        // Initialize refs
        playerRef.current = { ...player };
        enemiesRef.current = [...enemies];
        projectilesRef.current = [...projectiles];
        const update = () => {
            // Move player
            playerRef.current = movePlayer(playerRef.current, directionRef.current, viewport, bottomBlocker);
            // Move enemies
            enemiesRef.current = moveEnemies(enemiesRef.current, playerRef.current);
            // Move projectiles
            projectilesRef.current = moveProjectiles(projectilesRef.current, viewport);
            // Auto-attack: shoot every 0.5s
            if (enemiesRef.current.length > 0 && Date.now() - lastShotTime > 500) {
                const nearest = enemiesRef.current.reduce((a, b) => {
                    const da = Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y);
                    const db = Math.hypot(playerRef.current.x - b.x, playerRef.current.y - b.y);
                    return da < db ? a : b;
                }, enemiesRef.current[0]);
                const dx = nearest.x - playerRef.current.x;
                const dy = nearest.y - playerRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    projectilesRef.current.push(
                        createProjectile(
                            playerRef.current.x,
                            playerRef.current.y,
                            (dx / dist) * 7,
                            (dy / dist) * 7
                        )
                    );
                    lastShotTime = Date.now();
                }
            }
            // Check collision: player/enemy
            for (const e of enemiesRef.current) {
                const dx = playerRef.current.x - e.x;
                const dy = playerRef.current.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < playerRef.current.size + e.size) {
                    setGameOver(true);
                    return;
                }
            }
            // Check collision: projectile/enemy
            const hitEnemies = new Set<number>();
            const hitProjectiles = new Set<number>();
            enemiesRef.current.forEach((e, ei) => {
                projectilesRef.current.forEach((p, pi) => {
                    const dx = p.x - e.x;
                    const dy = p.y - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < p.size + e.size) {
                        hitEnemies.add(ei);
                        hitProjectiles.add(pi);
                    }
                });
            });
            enemiesRef.current = enemiesRef.current.filter((_, i) => !hitEnemies.has(i));
            projectilesRef.current = projectilesRef.current.filter((_, i) => !hitProjectiles.has(i));
            // Commit state for rendering
            setPlayer({ ...playerRef.current });
            setEnemies([...enemiesRef.current]);
            setProjectiles([...projectilesRef.current]);
            animationId = requestAnimationFrame(update);
        };
        animationId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationId);
    }, [direction, gameOver, viewport]);

    // Drawing
    React.useEffect(() => {
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
        // Draw player
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
        ctx.fillStyle = '#e11d48';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
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
        if (gameOver) {
            ctx.font = 'bold 32px sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', viewport.width / 2, viewport.height / 2);
        }
    }, [player, enemies, projectiles, gameOver, viewport]);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    width: '100vw',
                    height: '100dvh',
                    display: 'block',
                    background: '#222',
                    borderRadius: 0,
                    boxShadow: '0 4px 24px #0008',
                    touchAction: 'none',
                }}
            />
            {gameOver && (
                <button
                    className="mt-4 px-6 py-2 bg-pink-600 text-white rounded shadow"
                    onClick={() => {
                        setPlayer(createPlayer(viewport.width / 2, viewport.height / 2));
                        setProjectiles([]);
                        setGameOver(false);
                    }}
                >Restart</button>
            )}
        </>
    );
};

export default GameContainer;
