import React, { useRef, useState } from "react";
import { createEnemy } from "../game/enemy/enemy";
import { useEnemySpawner } from '../game/hooks/useEnemySpawner';
import { useGameDraw } from '../game/hooks/useGameDraw';
import { useGameLoop } from '../game/hooks/useGameLoop';
import { useKeyboardMovement, useTouchMovement } from '../game/hooks/usePlayerInput';
import { useViewport } from '../game/hooks/useViewport';
import { createPlayer } from "../game/player/player";
import { Enemy, Player, Projectile, XPOrb } from "../game/types";

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
    const [xpOrbs, setXpOrbs] = useState<XPOrb[]>([]);
    const xpOrbsRef = useRef<XPOrb[]>(xpOrbs);
    const [gameOver, setGameOver] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Sync refs
    React.useEffect(() => { playerRef.current = player; }, [player]);
    React.useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
    React.useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);
    React.useEffect(() => { directionRef.current = direction; }, [direction]);
    React.useEffect(() => { xpOrbsRef.current = xpOrbs; }, [xpOrbs]);

    useKeyboardMovement(setDirection);
    useTouchMovement(setDirection);

    // Auto-spawn enemies using custom hook
    useEnemySpawner({
        gameOver,
        viewport,
        setEnemies,
        createEnemy,
        intervalMs: 200
    });

    // Main game loop
    useGameLoop({
        player,
        setPlayer,
        playerRef,
        directionRef,
        enemies,
        setEnemies,
        enemiesRef,
        projectiles,
        setProjectiles,
        projectilesRef,
        xpOrbs,
        setXpOrbs,
        xpOrbsRef,
        gameOver,
        setGameOver,
        viewport
    });

    // Drawing
    useGameDraw({
        player,
        enemies,
        projectiles,
        xpOrbs,
        gameOver,
        viewport,
        canvasRef
    });

    return (
        <>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                zIndex: 10,
                color: '#fff',
                fontSize: 18,
                padding: 16,
                pointerEvents: 'none',
                textShadow: '0 2px 8px #000a',
            }}>
                <span>Level: {player.level}</span>
                <span style={{ marginLeft: 24 }}>XP: {player.xp} / {player.xpToLevel}</span>
            </div>
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
