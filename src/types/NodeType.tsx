import { ReactNode } from 'react';

export interface Project {
    id: string;
    name: string;
    is_public: boolean;
    collaborators: Array<{ email: string; id: string }>;
    created_at: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface Port {
    id: string;
    type: 'input' | 'output';
    name: string;
    dataType: string;
    label: string;
}

export interface Node {
    id: string;
    type: string;
    position: Position;
    inputs: Port[];
    outputs: Port[];
    data: Array<NodeData>;
    title: string;
}

export interface Connection {
    id: string;
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
}

export interface NodeData {
    name: string;   
    dataType: string;
    value: string;
}

export interface NodeTemplate {
    type: string;
    title: string;
    inputs: Array<Omit<Port, 'id' | 'type'>>;
    outputs: Array<Omit<Port, 'id' | 'type'>>;
    data: Array<NodeData>;
    component: React.ComponentType<NodeComponentProps>;
}

export interface NodeComponentProps {
    node: Node;
    onPortConnect: (nodeId: string, portId: string, portType: 'input' | 'output', position: Position) => void;
    isSelected: boolean;
    onClick: () => void;
    handleDelete: () => void;
} 