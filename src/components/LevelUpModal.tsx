import React from 'react';
import { Upgrade } from '../game/upgrades/upgradePool';

interface LevelUpModalProps {
    upgrades: Upgrade[];
    onSelect: (upgrade: Upgrade) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ upgrades, onSelect }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upgrades.map((upgrade) => (
                    <button
                        key={upgrade.id}
                        style={{
                            background: '#222',
                            color: '#fff',
                            borderRadius: 16,
                            padding: 12,
                            minWidth: 60,
                            boxShadow: '0 4px 24px #000a',
                            cursor: 'pointer',
                            border: '3px solid #eab308',
                            transition: 'transform 0.1s',
                            outline: 'none',
                            borderStyle: 'solid',
                            font: 'inherit',
                            textAlign: 'left',
                        }}
                        onClick={() => onSelect(upgrade)}
                    >
                        <h2 style={{ fontSize: 22, marginBottom: 12 }}>{upgrade.name}</h2>
                        <p style={{ fontSize: 16, opacity: 0.85 }}>{upgrade.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
