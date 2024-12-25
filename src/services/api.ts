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