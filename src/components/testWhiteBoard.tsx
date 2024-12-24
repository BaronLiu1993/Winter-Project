import { Square, Circle, Triangle, Star } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { NodeTemplate, Node, Position, Connection as ConnectionType } from '../types/NodeType';
import { ConnectionArrow } from './ConnectionArrow';
import { useConnections } from '../contexts/ConnectionContext';
import { useGlobalZIndex } from '../contexts/GlobalZIndexContext';
import { Sidebar } from './Sidebar';

interface WhiteboardProps {
    nodeTemplates: NodeTemplate[];
    onExecute: (nodes: Node[], connections: ConnectionType[]) => void;
}

const ZoomableWhiteboard: React.FC<WhiteboardProps> = ({ nodeTemplates, onExecute }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const BOARDSIZE = 1000;
  const [nodes, setNodes] = useState<Node[]>([]);
    const { connections, setConnections } = useConnections();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragConnection, setDragConnection] = useState<{
      start: Position;
      sourceNodeId: string;
      sourcePortId: string;
      sourceType: 'input' | 'output';
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const { GlobalZIndex, setGlobalZIndex } = useGlobalZIndex();        

  {/* WHITEBOARD FUNCTIONALITY ====================================
  ===============================================================
  ===============================================================
  */}
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const { deltaY } = event;
    const scaleChange = deltaY > 0 ? 0.9 : 1.1;
    
    if (!containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const cursorX = event.clientX - bounds.left;
    const cursorY = event.clientY - bounds.top;

    const newScale = transform.scale * scaleChange;
    
    const x = (cursorX - transform.x) / transform.scale;
    const y = (cursorY - transform.y) / transform.scale;
    
    const newX = cursorX - x * newScale;
    const newY = cursorY - y * newScale;

    setTransform({
      x: newX,
      y: newY,
      scale: newScale,
    });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return;

    setIsDragging(true);
    setLastPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;
    if ((event.target as HTMLElement).closest('.node-identifier')) {
        return;
    }
    const dx = event.clientX - lastPosition.x;
    const dy = event.clientY - lastPosition.y;

    setTransform(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setLastPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
 
  {/* NODE FUNCTIONALITY ====================================
  ===============================================================
  ===============================================================
  */}
  const handlePortConnect = (nodeId: string, portId: string, portType: 'input' | 'output', position: Position) => {
    if (!dragConnection) {
        setDragConnection({ start: position, sourceNodeId: nodeId, sourcePortId: portId, sourceType: portType });
        return;
    }

    if (portType === dragConnection.sourceType || nodeId === dragConnection.sourceNodeId) {
        setDragConnection(null);
        return;
    }
    if (connections.some(conn => {
        return (
            conn.sourcePortId === dragConnection.sourcePortId 
            && conn.sourceNodeId === dragConnection.sourceNodeId
            && conn.targetPortId === portId 
            && conn.targetNodeId === nodeId
        );
    })) {
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
    setTimeout(() => {
        const connectionElement = document.getElementById(`conn-${connections.length + 1}`);
        if (connectionElement) {
            connectionElement.style.zIndex = (GlobalZIndex + 2).toString();
        }
        setGlobalZIndex(GlobalZIndex + 2);
    }, 10);
    setDragConnection(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
  };

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

    const getPortPosition = (el: HTMLElement): Position => {
        const rect = el.getBoundingClientRect();
        const canvas = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
        return {
            x: rect.left - canvas.left + rect.width / 2,
            y: rect.top - canvas.top + rect.height / 2
        };
    };
    {/* CONNECTION FUNCTIONALITY ====================================
    ===============================================================
    ===============================================================
    */}
    
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
    }, [scale, dragPosition]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
        <Sidebar
            nodeTemplates={nodeTemplates}
            onAddNode={handleAddNode}
        />
        <div id="view_window" style={{
            height: "100vh",
            width: "80vw", 
            marginBottom: "auto",
            marginLeft: "auto",
        }}>
            <div
                ref={containerRef}
                className="w-full h-96 bg-blue-200 overflow-hidden cursor-grab"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                style={{
                    touchAction: 'none',
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'subpixel-antialiased',
                    imageRendering: 'pixelated',
                    width: `${BOARDSIZE}px`,
                    height: `${BOARDSIZE}px`,
                }}
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
                            handleDelete={() => handleDeleteNode(node.id)}
                        />
                    ) : null;
                })}

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

                    {dragConnection && (
                        <ConnectionArrow
                            key="temp-connection"
                            id="-1"
                            start={dragConnection.sourceType === 'output' ? dragConnection.start : cursorPosition}
                            end={dragConnection.sourceType === 'output' ? cursorPosition : dragConnection.start}
                            isTemp={true}
                            startColor="#22c55e"
                            endColor="#3b82f6"
                        />
                    )}
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

export default ZoomableWhiteboard;