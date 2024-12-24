import React, { useState, useRef, useEffect } from 'react';
import { NodeTemplate, Node, Position, Connection as ConnectionType } from '../types/NodeType';
import { ConnectionArrow } from './ConnectionArrow';
import { useConnections } from '../contexts/ConnectionContext';
import { useGlobalZIndex } from '../contexts/GlobalZIndexContext';
import { Sidebar } from './Sidebar';
import { useBoardSize } from '../contexts/BoardSizeContext';

interface WhiteboardProps {
    nodeTemplates: NodeTemplate[];
    onExecute: (nodes: Node[], connections: ConnectionType[]) => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ nodeTemplates, onExecute }) => {
    const { boardSize } = useBoardSize();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [dragConnectionInfo, setDragConnectionInfo] = useState<{
        sourceNodeId: string;
        sourcePortId: string;
        sourceType: 'input' | 'output';
    } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [cursorPosition, setCursorPosition] = useState<Position>({ x: 0, y: 0 });
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const { connections, setConnections } = useConnections();
    const { GlobalZIndex, setGlobalZIndex } = useGlobalZIndex();        

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setCursorPosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        };  

        const handleMouseUp = (e: MouseEvent) => {
            setTimeout(() => setDragConnectionInfo(null), 100);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragPosition]); // Added dependencies for the zoom calculation

    // Rest of your existing code remains unchanged...
    const handleAddNode = (template: NodeTemplate) => {
        const newNode: Node = {
            id: `node-${Date.now()}`,
            type: template.type,
            position: { x: 200, y: 100 },
            inputs: template.inputs.map(input => ({
                id: `${input.name}-${Date.now()}`,
                type: 'input' as const,
                name: input.name,
                dataType: input.dataType,
                label: input.label
            })),
            outputs: template.outputs.map(output => ({
                id: `${output.name}-${Date.now()}`,
                type: 'output' as const,
                name: output.name,
                dataType: output.dataType,
                label: output.label
            })),
            title: template.title,
            data: template.data
        };
        setNodes(prev => [...prev, newNode]);
    };

    const handlePortConnect = (nodeId: string, portId: string, portType: 'input' | 'output', position: Position) => {
        if (!dragConnectionInfo) {
            setDragConnectionInfo({ 
                sourceNodeId: nodeId, 
                sourcePortId: portId, 
                sourceType: portType 
            });
            return;
        }

        if (portType === dragConnectionInfo.sourceType || nodeId === dragConnectionInfo.sourceNodeId) {
            setDragConnectionInfo(null);
            return;
        }
        if (connections.some(conn => {
            return (
                conn.sourcePortId === dragConnectionInfo.sourcePortId 
                && conn.sourceNodeId === dragConnectionInfo.sourceNodeId
                && conn.targetPortId === portId 
                && conn.targetNodeId === nodeId
            );
        })) {
            setDragConnectionInfo(null);
            return;
        }

        const [sourceId, targetId] = portType === 'input' 
            ? [dragConnectionInfo.sourcePortId, portId]
            : [portId, dragConnectionInfo.sourcePortId];

        const [sourceNodeId, targetNodeId] = portType === 'input'
            ? [dragConnectionInfo.sourceNodeId, nodeId]
            : [nodeId, dragConnectionInfo.sourceNodeId];
        
        setConnections(prev => [...prev, {
            id: `conn-${connections.length + 1}`,
            sourceNodeId,
            sourcePortId: sourceId,
            targetNodeId,
            targetPortId: targetId
        }]);
        setTimeout(() => {
            const connectionElement = document.getElementById(`conn-${connections.length + 1}`);
            if (connectionElement) {
                connectionElement.style.zIndex = (GlobalZIndex + 2).toString();
            }
            setGlobalZIndex(GlobalZIndex + 2);
        }, 10);
        setDragConnectionInfo(null);
    };

    const updateNodePosition = (nodeId: string, newPosition: Position) => {
        setNodes(prev => prev.map(node => 
            node.id === nodeId 
                ? { ...node, position: newPosition }
                : node
        ));
    };

    const getPortPosition = (el: HTMLElement): Position => {
        const rect = el.getBoundingClientRect();
        const canvas = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
        return {
            x: rect.left - canvas.left + rect.width / 2,
            y: rect.top - canvas.top + rect.height / 2
        };
    };

    const handleDeleteNode = (nodeId: string) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === canvasRef.current) {
            setIsDragging(true);
            dragStart.current = {
                x: e.clientX - dragPosition.x,
                y: e.clientY - dragPosition.y
            };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setDragPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="w-full h-full bg-gray-100 whiteboard">
            <Sidebar 
                nodeTemplates={nodeTemplates} 
                onAddNode={handleAddNode} 
            />
            <div id="view_window" className="fixed w-full h-full overflow-hidden">
                <div 
                    ref={canvasRef}
                    className="relative"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={() => setSelectedNodeId(null)}
                    style={{
                        transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)`,
                        width: `${boardSize.width}px`,
                        left: "192px",
                        height: `${boardSize.height}px`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        transformOrigin: '0 0',
                        backgroundColor: 'white',
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                >
                    {connections.map(conn => {
                        const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
                        const targetNode = nodes.find(n => n.id === conn.targetNodeId);
                        if (!sourceNode || !targetNode) return null;

                        const sourcePort = sourceNode.outputs.find(p => p.id === conn.sourcePortId);
                        const targetPort = targetNode.inputs.find(p => p.id === conn.targetPortId);
                        if (!sourcePort || !targetPort) return null;

                        const sourceEl = document.querySelector(`[data-port-id="${conn.sourcePortId}"][data-port-type="output"]`);
                        const targetEl = document.querySelector(`[data-port-id="${conn.targetPortId}"][data-port-type="input"]`);
                        if (!sourceEl || !targetEl) return null;

                        const sourcePos = getPortPosition(sourceEl as HTMLElement);
                        const targetPos = getPortPosition(targetEl as HTMLElement);

                        return (
                            <ConnectionArrow
                                key={conn.id}
                                id={conn.id}
                                start={sourcePos}
                                end={targetPos}
                                onDelete={() => {
                                    setConnections(prev => prev.filter(c => c.id !== conn.id));
                                }}
                                onAddNode={() => {
                                    console.log('Add node between connection:', conn);
                                }}
                                startColor="#22c55e"
                                endColor="#3b82f6"
                            />
                        );
                    })}

                    {dragConnectionInfo && (
                        <ConnectionArrow
                            key="temp-connection"
                            id="-1"
                            start={(() => {
                                const sourceEl = document.querySelector(
                                    `[data-port-id="${dragConnectionInfo.sourcePortId}"][data-port-type="${dragConnectionInfo.sourceType}"]`
                                );
                                return sourceEl ? getPortPosition(sourceEl as HTMLElement) : { x: 0, y: 0 };
                            })()}
                            end={cursorPosition}
                            isTemp={true}
                            startColor="#22c55e"
                            endColor="#3b82f6"
                        />
                    )}

                    {nodes.map(node => {
                        const Template = nodeTemplates.find(t => t.type === node.type)?.component;
                        return Template ? (
                            <Template
                                key={node.id}
                                node={node}
                                onPortConnect={handlePortConnect}
                                isSelected={selectedNodeId === node.id}
                                onClick={() => setSelectedNodeId(node.id)}
                                handleDelete={() => handleDeleteNode(node.id)}
                            />
                        ) : null;
                    })}
                </div>

                <button
                    className="absolute bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => onExecute(nodes, connections)}
                >
                    Execute Pipeline
                </button>
            </div>
        </div>
    );
};

export default Whiteboard;