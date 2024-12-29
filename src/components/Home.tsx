import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="w-full h-full bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Node Editor</h1>
                    <p className="text-gray-600">Create and manage your node-based workflows</p>
                </div>

                {/* Recent Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Projects</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <span>Project 1</span>
                                <span className="text-sm text-gray-500">2 days ago</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <span>Project 2</span>
                                <span className="text-sm text-gray-500">5 days ago</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                New Project
                            </button>
                            <button className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                Import Project
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
                        <p className="text-2xl font-bold text-gray-800">12</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-medium text-gray-500">Active Nodes</h3>
                        <p className="text-2xl font-bold text-gray-800">48</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-medium text-gray-500">Connections</h3>
                        <p className="text-2xl font-bold text-gray-800">86</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 