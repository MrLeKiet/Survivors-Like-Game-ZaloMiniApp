import { useEffect } from 'react';

export function useKeyboardMovement(setDirection: (cb: (d: { x: number, y: number }) => { x: number, y: number }) => void) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setDirection(d => ({ ...d, y: -1 }));
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') setDirection(d => ({ ...d, y: 1 }));
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setDirection(d => ({ ...d, x: -1 }));
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setDirection(d => ({ ...d, x: 1 }));
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setDirection(d => ({ ...d, y: d.y === -1 ? 0 : d.y }));
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') setDirection(d => ({ ...d, y: d.y === 1 ? 0 : d.y }));
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setDirection(d => ({ ...d, x: d.x === -1 ? 0 : d.x }));
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setDirection(d => ({ ...d, x: d.x === 1 ? 0 : d.x }));
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [setDirection]);
}

export function useTouchMovement(setDirection: (d: { x: number, y: number }) => void) {
    useEffect(() => {
        let startX = 0, startY = 0;
        let moving = false;
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                moving = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (moving && e.touches.length === 1) {
                const dx = e.touches[0].clientX - startX;
                const dy = e.touches[0].clientY - startY;
                setDirection({
                    x: Math.abs(dx) > 20 ? Math.sign(dx) : 0,
                    y: Math.abs(dy) > 20 ? Math.sign(dy) : 0,
                });
            }
        };
        const handleTouchEnd = () => {
            moving = false;
            setDirection({ x: 0, y: 0 });
        };
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [setDirection]);
}
