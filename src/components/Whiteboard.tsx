import React, { useState, useEffect, useRef } from 'react';
import { NodeTemplate, Node, Connection, Position } from '../types/NodeType';

interface WhiteboardProps {
    nodeTemplates: NodeTemplate[];
    onExecute: (nodes: Node[], connections: Connection[]) => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ nodeTemplates, onExecute }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [draggingNode, setDraggingNode] = useState<{id: string, offset: Position} | null>(null);
    const [connectingPort, setConnectingPort] = useState<{
        nodeId: string;
        portId: string;
        type: 'input' | 'output';
        position: Position;
    } | null>(null);
    const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const newMousePos = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                setMousePosition(newMousePos);

                if (draggingNode) {
                    const newPosition = {
                        x: e.clientX - draggingNode.offset.x,
                        y: e.clientY - draggingNode.offset.y
                    };
                    setNodes(nodes.map(node =>
                        node.id === draggingNode.id ? { ...node, position: newPosition } : node
                    ));
                }
            }
        };

        const handleMouseUp = () => {
            setDraggingNode(null);
            if (!connectingPort) return;
            
            // If we're not over a valid port, cancel the connection
            const portElement = document.elementFromPoint(mousePosition.x, mousePosition.y);
            if (!portElement?.classList.contains('port')) {
                setConnectingPort(null);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingNode, nodes, connectingPort, mousePosition.x, mousePosition.y]);

    const handleAddNode = (template: NodeTemplate) => {
        const newNode: Node = {
            id: `node-${Date.now()}`,
            type: template.type,
            position: { x: 200, y: 100 },
            inputs: template.inputs.map(input => ({
                id: `${input.name}-${Date.now()}`,
                type: 'input',
                name: input.name,
                dataType: input.dataType,
                connections: []
            })),
            outputs: template.outputs.map(output => ({
                id: `${output.name}-${Date.now()}`,
                type: 'output',
                name: output.name,
                dataType: output.dataType,
                connections: []
            })),
            data: template.defaultData || {},
            title: template.title
        };
        setNodes(prev => [...prev, newNode]);
    };

    const handleDragStart = (nodeId: string, offset: Position) => {
        setDraggingNode({ id: nodeId, offset });
    };

    const handlePortConnect = (nodeId: string, portId: string, portType: 'input' | 'output', position: Position) => {
        if (!connectingPort) {
            setConnectingPort({ nodeId, portId, type: portType, position });
            return;
        }

        // Don't connect if same port type or same node
        if (connectingPort.type === portType || connectingPort.nodeId === nodeId) {
            setConnectingPort(null);
            return;
        }

        const [sourceId, targetId] = portType === 'input' 
            ? [connectingPort.portId, portId]
            : [portId, connectingPort.portId];

        const [sourceNodeId, targetNodeId] = portType === 'input'
            ? [connectingPort.nodeId, nodeId]
            : [nodeId, connectingPort.nodeId];

        const newConnection: Connection = {
            id: `conn-${Date.now()}`,
            sourceNodeId,
            sourcePortId: sourceId,
            targetNodeId,
            targetPortId: targetId
        };

        setConnections(prev => [...prev, newConnection]);
        setConnectingPort(null);
    };

    const renderConnections = () => {
        return (
            <svg className="absolute inset-0 pointer-events-none">
                {/* Existing Connections */}
                {connections.map(conn => {
                    const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
                    const targetNode = nodes.find(n => n.id === conn.targetNodeId);
                    if (!sourceNode || !targetNode) return null;

                    const sourcePort = sourceNode.outputs.find(p => p.id === conn.sourcePortId);
                    const targetPort = targetNode.inputs.find(p => p.id === conn.targetPortId);
                    if (!sourcePort || !targetPort) return null;

                    const sourcePos = {
                        x: sourceNode.position.x + 200,
                        y: sourceNode.position.y + 30 + (sourceNode.outputs.indexOf(sourcePort) * 30)
                    };
                    const targetPos = {
                        x: targetNode.position.x,
                        y: targetNode.position.y + 30 + (targetNode.inputs.indexOf(targetPort) * 30)
                    };

                    return (
                        <path
                            key={conn.id}
                            d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 100} ${sourcePos.y}, ${targetPos.x - 100} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`}
                            stroke="#666"
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                        />
                    );
                })}

                {/* Connection being dragged */}
                {connectingPort && (
                    <path
                        d={`M ${connectingPort.position.x} ${connectingPort.position.y} C ${connectingPort.position.x + 100} ${connectingPort.position.y}, ${mousePosition.x - 100} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`}
                        stroke="#666"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                        markerEnd="url(#arrowhead)"
                    />
                )}

                {/* Arrow marker definition */}
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                    </marker>
                </defs>
            </svg>
        );
    };

    return (
        <div className="relative w-full h-full bg-gray-100">
            {/* Node Templates Sidebar */}
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

            {/* Canvas */}
            <div 
                ref={canvasRef}
                className="ml-48 h-full relative overflow-hidden" 
                onClick={() => {
                    setSelectedNodeId(null);
                    setConnectingPort(null);
                }}
            >
                {renderConnections()}
                {nodes.map(node => {
                    const Template = nodeTemplates.find(t => t.type === node.type)?.component;
                    return Template ? (
                        <Template
                            key={node.id}
                            node={node}
                            onPortConnect={handlePortConnect}
                            isSelected={selectedNodeId === node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            onDragStart={handleDragStart}
                        />
                    ) : null;
                })}
            </div>

            {/* Execute Button */}
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