import React from 'react';
import { Position } from '../types/NodeType';

interface ConnectionArrowProps {
    start: Position;
    end: Position;
    isTemp?: boolean;
}

export const ConnectionArrow: React.FC<ConnectionArrowProps> = ({ start, end, isTemp }) => (
    <svg 
        className="absolute inset-0 w-full h-full" 
        style={{ 
            zIndex: 9999,
            pointerEvents: 'none',
            userSelect: 'none'
        }}
    >
        <defs>
            <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
            >
                <polygon points="0 0, 6 2, 0 4" fill="#ff0000" />
            </marker>
        </defs>
        <path
            d={`M ${start.x} ${start.y} C ${start.x + 100} ${start.y}, ${end.x - 100} ${end.y}, ${end.x} ${end.y}`}
            stroke="#ff0000"
            strokeWidth="5"
            fill="none"
            strokeDasharray={isTemp ? "5,5" : "none"}
            markerEnd="url(#arrowhead)"
        />
    </svg>
);