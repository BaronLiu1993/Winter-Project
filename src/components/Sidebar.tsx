import React, { useState } from 'react';
import { NodeTemplate } from '../types/NodeType';
import { Menu, X, Settings, Code, Database, FileText } from 'lucide-react';

interface SidebarProps {
    nodeTemplates: NodeTemplate[];
    onAddNode: (template: NodeTemplate) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ nodeTemplates, onAddNode }) => {
    const [isMenuMode, setIsMenuMode] = useState(false);
    const [currentSection, setCurrentSection] = useState<'nodes' | 'settings' | 'code' | 'data' | 'docs'>('nodes');

    const renderContent = () => {
        switch (currentSection) {
            case 'nodes':
                return (
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
                );
            case 'settings':
                return (
                    <div className="space-y-4">
                        <h3 className="font-medium">Settings</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Dark Mode</span>
                                <button className="p-2 bg-gray-100 rounded">Toggle</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Grid Size</span>
                                <input type="number" className="w-20 p-1 border rounded" />
                            </div>
                        </div>
                    </div>
                );
            case 'code':
                return (
                    <div className="space-y-4">
                        <h3 className="font-medium">Generated Code</h3>
                        <pre className="bg-gray-100 p-2 rounded text-sm">
                            {`// Your code here\nfunction example() {\n  return true;\n}`}
                        </pre>
                    </div>
                );
            case 'data':
                return (
                    <div className="space-y-4">
                        <h3 className="font-medium">Data Management</h3>
                        <div className="space-y-2">
                            <button className="w-full p-2 bg-green-500 text-white rounded">
                                Import Data
                            </button>
                            <button className="w-full p-2 bg-blue-500 text-white rounded">
                                Export Data
                            </button>
                        </div>
                    </div>
                );
            case 'docs':
                return (
                    <div className="space-y-4">
                        <h3 className="font-medium">Documentation</h3>
                        <div className="space-y-2 text-sm">
                            <p>Learn how to use the node editor...</p>
                            <a href="#" className="text-blue-500 hover:underline">View Full Docs</a>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed left-0 top-0 w-48 h-full bg-white shadow-lg z-50 sidebar flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <span className="font-semibold text-gray-700">
                    {isMenuMode ? 'Menu' : currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
                </span>
                <button 
                    onClick={() => setIsMenuMode(!isMenuMode)}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    {isMenuMode ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                {isMenuMode ? (
                    <div className="p-2 space-y-1">
                        <button 
                            onClick={() => { setCurrentSection('nodes'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <Database size={18} /> Nodes
                        </button>
                        <button 
                            onClick={() => { setCurrentSection('settings'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <Settings size={18} /> Settings
                        </button>
                        <button 
                            onClick={() => { setCurrentSection('code'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <Code size={18} /> Code
                        </button>
                        <button 
                            onClick={() => { setCurrentSection('data'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <Database size={18} /> Data
                        </button>
                        <button 
                            onClick={() => { setCurrentSection('docs'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <FileText size={18} /> Docs
                        </button>
                    </div>
                ) : (
                    <div className="p-4">
                        {renderContent()}
                    </div>
                )}
            </div>

            {!isMenuMode && currentSection === 'nodes' && (
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gray-50 border-t">
                    <div className="text-sm text-gray-500">
                        Drag nodes here to delete
                    </div>
                </div>
            )}
        </div>
    );
}; 