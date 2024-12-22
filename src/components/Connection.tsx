import React from 'react';
import { Position } from '../types/NodeType';

interface ConnectionProps {
    start: Position;
    end: Position;
    isTemp?: boolean;
}

export const Connection: React.FC<ConnectionProps> = ({ start, end, isTemp = false }) => {
    const path = `M ${start.x} ${start.y} C ${start.x + 100} ${start.y}, ${end.x - 100} ${end.y}, ${end.x} ${end.y}`;

    return (
        <path
            d={path}
            stroke="#666"
            strokeWidth="2"
            fill="none"
            strokeDasharray={isTemp ? "5,5" : "none"}
            markerEnd="url(#arrowhead)"
        />
    );
}; 