import React from 'react';
import { NodeTemplate } from '../types/NodeType';
import { BaseNode } from '../components/BaseNode';
import Whiteboard from '../components/Whiteboard';

// Define three different node templates
const nodeTemplates: NodeTemplate[] = [
    {
        type: 'imageLoader',
        title: 'Image Loader',
        inputs: [],
        outputs: [
            { name: 'image', dataType: 'image', label: 'Output Image' }
        ],
        component: BaseNode,
        defaultData: {}
    },
    {
        type: 'imageProcessor',
        title: 'Image Processor',
        inputs: [
            { name: 'input', dataType: 'image', label: 'Input Image' }
        ],
        outputs: [
            { name: 'output', dataType: 'image', label: 'Processed Image' }
        ],
        component: BaseNode,
        defaultData: {
            brightness: 1.0,
            contrast: 1.0
        }
    },
    {
        type: 'imageClassifier',
        title: 'Image Classifier',
        inputs: [
            { name: 'image', dataType: 'image', label: 'Input Image' }
        ],
        outputs: [
            { name: 'classes', dataType: 'array', label: 'Classifications' }
        ],
        component: BaseNode,
        defaultData: {
            threshold: 0.5,
            maxResults: 5
        }
    }
];

const HomePage: React.FC = () => {
    const handleExecute = async (nodes: any[], connections: any[]) => {
        console.log('Executing pipeline:', { nodes, connections });
        try {
            const response = await fetch('/api/execute-pipeline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, connections })
            });
            const result = await response.json();
            console.log('Pipeline result:', result);
        } catch (error) {
            console.error('Pipeline execution failed:', error);
        }
    };

    return (
        <div className="w-full h-screen bg-gray-50">
            <Whiteboard 
                nodeTemplates={nodeTemplates}
                onExecute={handleExecute}
            />
        </div>
    );
};

export default HomePage;