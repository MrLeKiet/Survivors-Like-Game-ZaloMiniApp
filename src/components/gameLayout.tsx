import React from 'react';

interface GameLayoutProps {
    children: React.ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => (
    <div className="flex flex-col items-center w-full h-full" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
        {children}
    </div>
);

export default GameLayout;
