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

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const newPosition = {
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y
        };
        setPosition(newPosition);
        node.position = newPosition;
    };

    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (!isDragging) return;
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
        const nodeRect = el.closest('.node')?.getBoundingClientRect() || rect;
        
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
            <div className="font-bold mb-4 text-center">{node.title}</div>
            
            <div className="flex justify-between">
                {/* Inputs Column */}
                <div className="space-y-4 w-1/2">
                    {node.inputs.map(port => (
                        <div key={port.id} className="flex items-center">
                            <div
                                className="port w-3 h-3 rounded-full bg-blue-500 cursor-crosshair"
                                data-port-id={port.id}
                                data-port-type="input"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    onPortConnect(node.id, port.id, 'input', getPortPosition(e.currentTarget));
                                }}
                                onMouseUp={(e) => {
                                    e.stopPropagation();
                                    onPortConnect(node.id, port.id, 'input', getPortPosition(e.currentTarget));
                                }}
                            />
                            <span className="ml-2 text-sm">{port.name}</span>
                        </div>
                    ))}
                </div>

                {/* Outputs Column */}
                <div className="space-y-4 w-1/2">
                    {node.outputs.map(port => (
                        <div key={port.id} className="flex items-center justify-end">
                            <span className="mr-2 text-sm">{port.name}</span>
                            <div
                                className="port w-3 h-3 rounded-full bg-green-500 cursor-crosshair"
                                data-port-id={port.id}
                                data-port-type="output"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    onPortConnect(node.id, port.id, 'output', getPortPosition(e.currentTarget));
                                }}
                                onMouseUp={(e) => {
                                    e.stopPropagation();
                                    onPortConnect(node.id, port.id, 'output', getPortPosition(e.currentTarget));
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 p-2 border-t border-gray-200">
                {node.data.map(data => {
                    if (data.dataType === 'text') {
                        return (
                            <div key={data.name} className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {data.name}
                                </label>
                                <textarea
                                    className="w-full p-2 border rounded-md text-sm resize-none"
                                    value={data.value}
                                    rows={3}
                                    placeholder={`Enter ${data.name}...`}
                                    onChange={(e) => {
                                        data.value = e.target.value;
                                    }}
                                />
                            </div>
                        );
                    }

                    if (data.dataType === 'file') {
                        return (
                            <div key={data.name} className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {data.name}
                                </label>
                                <div 
                                    className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.add('border-blue-500');
                                    }}
                                    onDragLeave={(e) => {
                                        e.currentTarget.classList.remove('border-blue-500');
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('border-blue-500');
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            data.value = file.name;
                                            // Handle file upload here
                                        }
                                    }}
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                                data.value = file.name;
                                                // Handle file upload here
                                            }
                                        };
                                        input.click();
                                    }}
                                >
                                    <div className="text-sm text-gray-600">
                                        {data.value ? (
                                            <span>{data.value}</span>
                                        ) : (
                                            <>
                                                <span>Drop file here or </span>
                                                <span className="text-blue-500">browse</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
}; 