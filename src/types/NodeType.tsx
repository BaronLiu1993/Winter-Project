import { ReactNode } from 'react';

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
    title: string;
}

export interface Connection {
    id: string;
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
}

export interface NodeTemplate {
    type: string;
    title: string;
    inputs: Array<Omit<Port, 'id' | 'type'>>;
    outputs: Array<Omit<Port, 'id' | 'type'>>;
    component: React.ComponentType<NodeComponentProps>;
}

export interface NodeComponentProps {
    node: Node;
    onPortConnect: (nodeId: string, portId: string, portType: 'input' | 'output', position: Position) => void;
    isSelected: boolean;
    onClick: () => void;
} 