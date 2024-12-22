import React, { useState, useRef, useEffect } from 'react';
import { NodeComponentProps, Position } from '../types/NodeType';

export const BaseNode: React.FC<NodeComponentProps> = ({ node, onPortConnect, isSelected, onClick }) => {
    const [position, setPosition] = useState(node.position);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef<Position>({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('port')) return;
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y
            });
        };

        const handleMouseUp = () => setIsDragging(false);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const getPortPosition = (el: HTMLElement): Position => {
        const rect = el.getBoundingClientRect();
        const canvas = el.closest('.ml-48')?.getBoundingClientRect() || { left: 0, top: 0 };
        return {
            x: rect.left - canvas.left + rect.width / 2,
            y: rect.top - canvas.top + rect.height / 2
        };
    };

    return (
        <div
            className={`absolute p-4 rounded-lg shadow-lg ${
                isSelected ? 'border-2 border-blue-500' : 'border border-gray-300'
            } bg-white cursor-move`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                minWidth: '200px',
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
                if ((e.target as HTMLElement).classList.contains('port')) return;
                if (!isDragging) onClick();
            }}
        >
            <div className="font-bold mb-2">{node.title}</div>
            
            <div className="space-y-2">
                {node.inputs.map(port => (
                    <div key={port.id} className="flex items-center">
                        <div
                            className="port w-3 h-3 rounded-full bg-blue-500 cursor-crosshair"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPortConnect(node.id, port.id, 'input', getPortPosition(e.currentTarget));
                            }}
                        />
                        <span className="ml-2">{port.name}</span>
                    </div>
                ))}
            </div>

            <div className="space-y-2 mt-2">
                {node.outputs.map(port => (
                    <div key={port.id} className="flex items-center justify-end">
                        <span className="mr-2">{port.name}</span>
                        <div
                            className="port w-3 h-3 rounded-full bg-green-500 cursor-crosshair"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPortConnect(node.id, port.id, 'output', getPortPosition(e.currentTarget));
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}; 