import React from 'react';
import { NodeTemplate } from '../types/NodeType';
import { BaseNode } from '../components/BaseNode';
import Whiteboard from '../components/Whiteboard';

const nodeTemplates: NodeTemplate[] = [
    {
        type: 'imageInput',
        title: 'Image Input',
        inputs: [],
        outputs: [{ name: 'image', dataType: 'image', label: 'Output Image' }],
        component: BaseNode
    }
];

export default function WhiteboardPage() {
    return (
        <div className="w-full h-screen">
            <Whiteboard 
                nodeTemplates={nodeTemplates}
                onExecute={(nodes, connections) => {
                    console.log('Pipeline:', { nodes, connections });
                }}
            />
        </div>
    );
} 