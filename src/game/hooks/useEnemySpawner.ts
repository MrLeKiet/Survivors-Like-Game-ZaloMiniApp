import { useEffect } from 'react';
import { Enemy } from '../types';

export function useEnemySpawner({
    gameOver,
    viewport,
    setEnemies,
    createEnemy,
    intervalMs = 5000
}: {
    gameOver: boolean,
    viewport: { width: number, height: number },
    setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>,
    createEnemy: (x: number, y: number) => Enemy,
    intervalMs?: number
}) {
    useEffect(() => {
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
        }, intervalMs);
        return () => clearInterval(interval);
    }, [gameOver, viewport, setEnemies, createEnemy, intervalMs]);
}
