import React, { useState } from 'react';
import { Position } from '../types/NodeType';

interface ConnectionArrowProps {
    start: Position;
    end: Position;
    isTemp?: boolean;
    onDelete?: () => void;
    onAddNode?: () => void;
}

export const ConnectionArrow: React.FC<ConnectionArrowProps> = ({ start, end, isTemp, onDelete, onAddNode }) => {
    const [showMenu, setShowMenu] = useState(false);

    // Calculate middle point of the curve
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    return (
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
            
            {!isTemp && (
                <>
                    {/* Interactive circle in the middle */}
                    <circle
                        cx={midX}
                        cy={midY}
                        r="6"
                        fill="#ff0000"
                        style={{ pointerEvents: 'all', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                    />

                    {/* Menu panel */}
                    {showMenu && (
                        <foreignObject
                            x={midX - 50}
                            y={midY + 10}
                            width="100"
                            height="80"
                            style={{ pointerEvents: 'all' }}
                        >
                            <div className="bg-white rounded shadow-lg border p-2">
                                <button
                                    className="w-full mb-2 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.();
                                        setShowMenu(false);
                                    }}
                                >
                                    Delete
                                </button>
                                <button
                                    className="w-full px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddNode?.();
                                        setShowMenu(false);
                                    }}
                                >
                                    Add Node
                                </button>
                            </div>
                        </foreignObject>
                    )}
                </>
            )}
        </svg>
    );
};