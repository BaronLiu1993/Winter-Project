import React, { useState, useRef, useEffect } from 'react';
import { NodeTemplate, Node, Position, Connection as ConnectionType } from '../types/NodeType';
import { ConnectionArrow } from './ConnectionArrow';

interface WhiteboardProps {
    nodeTemplates: NodeTemplate[];
    onExecute: (nodes: Node[], connections: ConnectionType[]) => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ nodeTemplates, onExecute }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<ConnectionType[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [dragConnection, setDragConnection] = useState<{
        start: Position;
        sourceNodeId: string;
        sourcePortId: string;
        sourceType: 'input' | 'output';
    } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [cursorPosition, setCursorPosition] = useState<Position>({ x: 0, y: 0 });

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
            setTimeout(() => setDragConnection(null), 100);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleAddNode = (template: NodeTemplate) => {
        const newNode: Node = {
            id: `node-${nodes.length + 1}`,
            type: template.type,
            position: { x: 200, y: 100 },
            inputs: template.inputs.map(input => ({
                id: `${input.name}-${nodes.length + 1}`,
                type: 'input' as const,
                name: input.name,
                dataType: input.dataType,
                label: input.label
            })),
            outputs: template.outputs.map(output => ({
                id: `${output.name}-${nodes.length + 1}`,
                type: 'output' as const,
                name: output.name,
                dataType: output.dataType,
                label: output.label
            })),
            title: template.title
        };
        setNodes(prev => [...prev, newNode]);
    };

    const handlePortConnect = (nodeId: string, portId: string, portType: 'input' | 'output', position: Position) => {
        if (!dragConnection) {
            setDragConnection({ start: position, sourceNodeId: nodeId, sourcePortId: portId, sourceType: portType });
            return;
        }

        if (portType === dragConnection.sourceType || nodeId === dragConnection.sourceNodeId) {
            setDragConnection(null);
            return;
        }

        const [sourceId, targetId] = portType === 'input' 
            ? [dragConnection.sourcePortId, portId]
            : [portId, dragConnection.sourcePortId];

        const [sourceNodeId, targetNodeId] = portType === 'input'
            ? [dragConnection.sourceNodeId, nodeId]
            : [nodeId, dragConnection.sourceNodeId];
        
        setConnections(prev => [...prev, {
            id: `conn-${connections.length + 1}`,
            sourceNodeId,
            sourcePortId: sourceId,
            targetNodeId,
            targetPortId: targetId
        }]);
        setDragConnection(null);
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

    return (
        <div className="relative w-full h-full bg-gray-100">
            <div className="absolute left-0 top-0 w-48 h-full bg-white p-4 shadow-lg">
                {nodeTemplates.map(template => (
                    <button
                        key={template.type}
                        className="w-full p-2 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => handleAddNode(template)}
                    >
                        {template.title}
                    </button>
                ))}
            </div>

            <div 
                ref={canvasRef}
                className="ml-48 h-full relative overflow-hidden"
                onClick={() => setSelectedNodeId(null)}
            >
                {connections.map(conn => {
                    const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
                    const targetNode = nodes.find(n => n.id === conn.targetNodeId);
                    if (!sourceNode || !targetNode) return null;

                    const sourcePort = sourceNode.outputs.find(p => p.id === conn.sourcePortId);
                    const targetPort = targetNode.inputs.find(p => p.id === conn.targetPortId);
                    if (!sourcePort || !targetPort) return null;

                    const sourceEl = document.querySelector(`[data-port-id="${conn.sourcePortId}"]`);
                    const targetEl = document.querySelector(`[data-port-id="${conn.targetPortId}"]`);
                    if (!sourceEl || !targetEl) return null;

                    const sourcePos = getPortPosition(sourceEl as HTMLElement);
                    const targetPos = getPortPosition(targetEl as HTMLElement);

                    return (
                        <ConnectionArrow
                            key={conn.id}
                            start={sourcePos}
                            end={targetPos}
                        />
                    );
                })}

                {dragConnection && (
                    <ConnectionArrow
                        start={dragConnection.start}
                        end={cursorPosition}
                        isTemp={true}
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
    );
};

export default Whiteboard;