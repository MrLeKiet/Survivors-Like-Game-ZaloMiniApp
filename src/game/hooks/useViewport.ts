import { useEffect, useState } from 'react';

export function useViewport() {
    function getViewport() {
        const width = window.innerWidth;
        let height = window.innerHeight;
        if (window.visualViewport) {
            height = window.visualViewport.height;
        } else {
            const cssDvh = getComputedStyle(document.documentElement).getPropertyValue('--100dvh');
            if (cssDvh) height = parseInt(cssDvh);
        }
        return { width, height };
    }
    const [viewport, setViewport] = useState(getViewport());
    useEffect(() => {
        const handleResize = () => setViewport(getViewport());
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        if (window.visualViewport) window.visualViewport.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            if (window.visualViewport) window.visualViewport.removeEventListener('resize', handleResize);
        };
    }, []);
    return viewport;
}
