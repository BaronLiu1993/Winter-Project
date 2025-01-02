import { useRouter } from 'next/router';
import React from 'react';
import Whiteboard from '../../components/Whiteboard';
import Sidebar from '../../components/Sidebar';
import { NodeTemplate } from '../../types/NodeType';
import { useState } from 'react';
import { openWhiteBoard } from '../../services/api';

const WhiteboardPage = () => {
    const router = useRouter();
    const { project_id } = router.query;

    const [projectData, setProjectData] = useState(null);

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <h1 className="text-2xl">Hello! Project ID: {project_id}</h1>
        </div>
    );
};

export default WhiteboardPage;