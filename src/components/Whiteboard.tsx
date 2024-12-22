import React, { useState, useRef } from 'react';
import { NodeTemplate, Node, Connection, Position } from '../types/NodeType';

interface WhiteboardProps {
    nodeTemplates: NodeTemplate[];
    onExecute: (nodes: Node[], connections: Connection[]) => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ nodeTemplates, onExecute }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [dragConnection, setDragConnection] = useState<{
        start: Position;
        sourceNodeId: string;
        sourcePortId: string;
        sourceType: 'input' | 'output';
    } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

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
        console.log(nodeId, portId, portType, position);

        const [sourceId, targetId] = portType === 'input' 
            ? [dragConnection.sourcePortId, portId]
            : [portId, dragConnection.sourcePortId];

        const [sourceNodeId, targetNodeId] = portType === 'input'
            ? [dragConnection.sourceNodeId, nodeId]
            : [nodeId, dragConnection.sourceNodeId];
        
        setConnections(prev => [...prev, {
            id: `conn-${Date.now()}`,
            sourceNodeId,
            sourcePortId: sourceId,
            targetNodeId,
            targetPortId: targetId
        }]);
        setDragConnection(null);
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