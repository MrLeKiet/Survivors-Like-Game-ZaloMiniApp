import React from 'react';

interface GameLayoutProps {
    children: React.ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => (
    <div className="flex flex-col items-center w-full h-full" style={{ overflow: 'hidden', position: 'relative', paddingTop: 'var(--safe-top)'}}>
        {children}
    </div>
);

export default GameLayout;
