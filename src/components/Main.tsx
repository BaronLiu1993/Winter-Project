import React, { useState } from 'react';
import { NodeTemplate } from '../types/NodeType';
import { BaseNode } from '../components/BaseNode';
import Whiteboard from '../components/Whiteboard';
import Sidebar from '../components/Sidebar';
import Home from '../components/Home';

const nodeTemplates: NodeTemplate[] = [
    {
        type: 'inputManager',
        title: 'Input Manager',
        inputs: [
            { name: 'input text', dataType: 'text', label: 'Input Text' }
        ],
        outputs: [
            { name: 'output', dataType: 'text', label: 'Output' },
            { name: 'output number', dataType: 'text', label: 'Output Number' }
        ],
        data: [
            { name: 'text', dataType: 'text', value: '' },
            { name: 'csv file', dataType: 'file', value: '' }
        ],
        component: BaseNode
    },
    {
        type: 'textProcessor',
        title: 'Text Processor',
        inputs: [{ name: 'input', dataType: 'text', label: 'Input Text' }],
        outputs: [{ name: 'output', dataType: 'text', label: 'Processed Text' }],
        data: [
            { name: 'text', dataType: 'text', value: '' },
        ],
        component: BaseNode
    },
    {
        type: 'dataClassifier',
        title: 'Data Classifier',
        inputs: [{ name: 'data', dataType: 'data', label: 'Input Data' }],
        outputs: [{ name: 'classes', dataType: 'array', label: 'Classifications' }],
        data: [
            { name: 'classes', dataType: 'text', value: '' }
        ],
        component: BaseNode
    }
];


const Main: React.FC = () => {
    const [currentView, setCurrentView] = useState<'home' | 'whiteboard'>('whiteboard');

    const renderMainComponent = (currentView: 'home' | 'whiteboard') => {
        switch (currentView) {
            case 'home':
                return <Home />;
            case 'whiteboard':
                return (
                    <Whiteboard 
                        nodeTemplates={nodeTemplates}
                        onExecute={(nodes, connections) => console.log('Executing:', { nodes, connections })}
                        setCurrentView={setCurrentView}
                    />
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="w-full h-screen bg-gray-100 whiteboard">
            <Sidebar 
                nodeTemplates={nodeTemplates} 
                setCurrentView={setCurrentView}
            />

            {renderMainComponent(currentView)}
    </div>
    );
};

export default Main;