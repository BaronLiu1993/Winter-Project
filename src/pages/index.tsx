import React from 'react';
import { NodeTemplate } from '../types/NodeType';
import { BaseNode } from '../components/BaseNode';
import Whiteboard from '../components/Whiteboard';

const nodeTemplates: NodeTemplate[] = [
    {
        type: 'imageLoader',
        title: 'Image Loader',
        inputs: [],
        outputs: [
            { name: 'image', dataType: 'image', label: 'Output Image' },
            { name: 'error', dataType: 'string', label: 'Error' }
        ],
        component: BaseNode
    },
    {
        type: 'imageProcessor',
        title: 'Image Processor',
        inputs: [{ name: 'input', dataType: 'image', label: 'Input Image' }],
        outputs: [{ name: 'output', dataType: 'image', label: 'Processed Image' }],
        component: BaseNode
    },
    {
        type: 'imageClassifier',
        title: 'Image Classifier',
        inputs: [{ name: 'image', dataType: 'image', label: 'Input Image' }],
        outputs: [{ name: 'classes', dataType: 'array', label: 'Classifications' }],
        component: BaseNode
    }
];

const HomePage: React.FC = () => (
    <div className="w-full h-screen bg-gray-50">
        <Whiteboard 
            nodeTemplates={nodeTemplates}
            onExecute={(nodes, connections) => console.log('Executing:', { nodes, connections })}
        />
    </div>
);

export default HomePage;