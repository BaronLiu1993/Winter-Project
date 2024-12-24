import React from 'react';
import { NodeTemplate } from '../types/NodeType';

interface SidebarProps {
    nodeTemplates: NodeTemplate[];
    onAddNode: (template: NodeTemplate) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ nodeTemplates, onAddNode }) => {
    return (
        <div className="fixed left-0 top-0 w-48 h-full bg-white p-4 shadow-lg z-50 sidebar"
        style={{
            zIndex: 999
        }}>
            <div className="text-lg font-semibold text-gray-700 mb-4">
                Node Templates
            </div>
            <div className="space-y-2">
                {nodeTemplates.map(template => (
                    <button
                        key={template.type}
                        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                                 transition-colors duration-200 flex items-center gap-2"
                        onClick={() => onAddNode(template)}
                    >
                        {template.title}
                    </button>
                ))}
            </div>
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gray-50 border-t">
                <div className="text-sm text-gray-500">
                    Drag nodes here to delete
                </div>
            </div>
        </div>
    );
}; 