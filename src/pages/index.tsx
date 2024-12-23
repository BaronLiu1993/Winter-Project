import React from 'react';
import { NodeTemplate } from '../types/NodeType';
import { BaseNode } from '../components/BaseNode';
import Whiteboard from '../components/Whiteboard';

const nodeTemplates: NodeTemplate[] = [
    {
        type: 'imageLoader',
        title: 'Image Loader',
        inputs: [
            { name: 'image', dataType: 'image', label: 'Input Image' }
        ],
        outputs: [
            { name: 'image', dataType: 'image', label: 'Output Image' },
            { name: 'error', dataType: 'string', label: 'Error' }
        ],
        data: [
            { name: 'image', dataType: 'text', value: '' },
            { name: 'error', dataType: 'text', value: '' }
        ],
        component: BaseNode
    },
    {
        type: 'imageProcessor',
        title: 'Image Processor',
        inputs: [{ name: 'input', dataType: 'image', label: 'Input Image' }],
        outputs: [{ name: 'output', dataType: 'image', label: 'Processed Image' }],
        data: [
            { name: 'image', dataType: 'file', value: '' },
            { name: 'error', dataType: 'text', value: '' }
        ],
        component: BaseNode
    },
    {
        type: 'imageClassifier',
        title: 'Image Classifier',
        inputs: [{ name: 'image', dataType: 'image', label: 'Input Image' }],
        outputs: [{ name: 'classes', dataType: 'array', label: 'Classifications' }],
        data: [
            { name: 'classes', dataType: 'text', value: '' }
        ],
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