import { createContext, useContext, useState, ReactNode } from 'react';
import { Node, Project } from '../types/NodeType';

interface ProjectContextType {
    project: Project | null;
    setProject: React.Dispatch<React.SetStateAction<Project | null>>;
}

export const ProjectContext = createContext<ProjectContextType>({
    project: null,
    setProject: () => {}
});

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [project, setProject] = useState<Project | null>({
        id: "example-project",
        name: "Example Project",
        nodes: [],
        connections: [],
        collaborators: [],
        is_public: false,
        created_at: new Date().toISOString(),
    });

    return (
        <ProjectContext.Provider value={{ project, setProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);