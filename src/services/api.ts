const API_BASE_URL = 'http://localhost:8000/api';

export const executePipeline = async (nodes: any[], connections: any[]) => {
    const response = await fetch(`${API_BASE_URL}/execute-pipeline/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, connections }),
    });

    if (!response.ok) {
        throw new Error('Pipeline execution failed');
    }

    return response.json();
}; 

export const newProject = async (
    user_id: string, 
    project_name: string, 
    collaborators: any[],
    isPublic: boolean
) => {
    const response = await fetch(`${API_BASE_URL}/new-project/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user_id, 
            project_name, 
            collaborators,
            is_public: isPublic 
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to create new project');
    }

    return response.json();
};

export const getRecentProjects = async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/recent-projects/?user_id=${userId}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch recent projects');
    }

    return response.json();
};
