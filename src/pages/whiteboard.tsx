import React from 'react';
import { NodeTemplate, Node, Connection } from '../types/NodeType';
import { BaseNode } from '../components/BaseNode';
import Whiteboard from '../components/Whiteboard';

// Define example node templates
const nodeTemplates: NodeTemplate[] = [
    {
        type: 'imageInput',
        title: 'Image Input',
        inputs: [],
        outputs: [
            { name: 'image', dataType: 'image', label: 'Output Image' }
        ],
        component: BaseNode
    },
    // ... other templates
];

const WhiteboardPage: React.FC = () => {
    const handleExecute = (nodes: Node[], connections: Connection[]) => {
        console.log('Executing pipeline:', { nodes, connections });
        fetch('/api/execute-pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes, connections })
        });
    };

    return (
        <div className="w-full h-screen">
            <Whiteboard 
                nodeTemplates={nodeTemplates}
                onExecute={handleExecute}
            />
        </div>
    );
};

export default WhiteboardPage; 