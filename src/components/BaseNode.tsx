import React, { useState, MouseEvent } from 'react';
import { NodeComponentProps, Position } from '../types/NodeType';

export const BaseNode: React.FC<NodeComponentProps> = ({ 
    node, 
    onPortConnect, 
    isSelected, 
    onClick,
    onDragStart,
    onDrag,
    onDragEnd 
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e: MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('port')) {
            return;
        }
        
        e.stopPropagation();
        setIsDragging(true);
        const offset = {
            x: e.clientX - node.position.x,
            y: e.clientY - node.position.y
        };
        onDragStart?.(node.id, offset);
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd?.(node.id);
        }
    };

    const getPortPosition = (portElement: HTMLElement): Position => {
        const rect = portElement.getBoundingClientRect();
        const canvasRect = portElement.closest('.ml-48')?.getBoundingClientRect() || { left: 0, top: 0 };
        return {
            x: rect.left - canvasRect.left + rect.width / 2,
            y: rect.top - canvasRect.top + rect.height / 2
        };
    };

    return (
        <div
            className={`absolute p-4 rounded-lg shadow-lg ${
                isSelected ? 'border-2 border-blue-500' : 'border border-gray-300'
            } bg-white cursor-move`}
            style={{
                transform: `translate(${node.position.x}px, ${node.position.y}px)`,
                minWidth: '200px',
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={(e) => {
                if ((e.target as HTMLElement).classList.contains('port')) {
                    return;
                }
                e.stopPropagation();
                if (!isDragging) {
                    onClick();
                }
            }}
        >
            <div className="font-bold mb-2 node-header">{node.title}</div>
            
            {/* Input Ports */}
            <div className="space-y-2">
                {node.inputs.map(port => (
                    <div key={port.id} className="flex items-center">
                        <div
                            className="port w-3 h-3 rounded-full bg-blue-500 cursor-crosshair"
                            onClick={(e) => {
                                e.stopPropagation();
                                const position = getPortPosition(e.currentTarget);
                                onPortConnect(node.id, port.id, 'input', position);
                            }}
                        />
                        <span className="ml-2">{port.name}</span>
                    </div>
                ))}
            </div>

            {/* Output Ports */}
            <div className="space-y-2 mt-2">
                {node.outputs.map(port => (
                    <div key={port.id} className="flex items-center justify-end">
                        <span className="mr-2">{port.name}</span>
                        <div
                            className="port w-3 h-3 rounded-full bg-green-500 cursor-crosshair"
                            onClick={(e) => {
                                e.stopPropagation();
                                const position = getPortPosition(e.currentTarget);
                                onPortConnect(node.id, port.id, 'output', position);
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}; 