import React, { useRef, useState } from "react";
import { createEnemy, ENEMY_SPAWN_INTERVAL } from "../game/enemy/enemy";
import { useEnemySpawner } from '../game/hooks/useEnemySpawner';
import { useGameDraw } from '../game/hooks/useGameDraw';
import { useGameLoop } from '../game/hooks/useGameLoop';
import { useKeyboardMovement, useTouchMovement } from '../game/hooks/usePlayerInput';
import { useViewport } from '../game/hooks/useViewport';
import { createPlayer } from "../game/player/player";
import { Enemy, Player, Projectile, XPOrb } from "../game/types";
import { getRandomUpgrades } from '../game/upgrades/getRandomUpgrades';
import { Upgrade, UPGRADE_POOL } from '../game/upgrades/upgradePool';
import { LevelUpModal } from './LevelUpModal';

const GameContainer: React.FC = () => {
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpChoices, setLevelUpChoices] = useState<Upgrade[]>([]);
    const [pendingLevel, setPendingLevel] = useState<number|null>(null);
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
        intervalMs: ENEMY_SPAWN_INTERVAL,
        paused: showLevelUp
    });

    // Custom setter to update both state and ref for XP orbs
    const setXpOrbsSync = (updater) => {
        setXpOrbs(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            xpOrbsRef.current = next;
            return next;
        });
    };
    // Track last level for level-up detection
    const lastLevelRef = useRef(player.level);

    // Main game loop (paused if modal is open)
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
        setXpOrbs: setXpOrbsSync,
        xpOrbsRef,
        gameOver: showLevelUp ? true : gameOver, // Pause game when modal is open
        setGameOver,
        viewport
    });

    // Detect level up and show modal
    React.useEffect(() => {
        if (player.level > lastLevelRef.current) {
            setShowLevelUp(true);
            setLevelUpChoices(getRandomUpgrades(UPGRADE_POOL, 3));
            setPendingLevel(player.level);
        }
        lastLevelRef.current = player.level;
    }, [player.level]);
    // Handle upgrade selection
    const handleUpgradeSelect = (upgrade: Upgrade) => {
        if (pendingLevel !== null) {
            // Apply upgrade to player
            upgrade.apply(playerRef.current);
            setPlayer({ ...playerRef.current });
            setShowLevelUp(false);
            setPendingLevel(null);
        }
    };

    // Drawing (use refs for smooth movement)
    useGameDraw({
        player: playerRef.current,
        enemies,
        projectiles,
        xpOrbs, // Use state, not ref
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
                className="h-full"
                style={{
                    width: '100vw',
                    display: 'block',
                    background: '#111827',
                    borderRadius: 0,
                    boxShadow: '0 4px 24px #0008',
                    touchAction: 'none',
                }}
            />
            {showLevelUp && (
                <LevelUpModal upgrades={levelUpChoices} onSelect={handleUpgradeSelect} />
            )}
        </>
    );
};

export default GameContainer;
