import { createContext, useContext, useState, ReactNode } from 'react';
import { Connection } from '../types/NodeType';

interface BoardSizeContextType {
    boardSize: number;
    setBoardSize: (value: number | ((prev: number) => number)) => void;
}

export const BoardSizeContext = createContext<BoardSizeContextType>({
    boardSize: 1000,
    setBoardSize: () => {}
});

export const BoardSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [boardSize, setBoardSize] = useState<number>(1000);

    return (
        <BoardSizeContext.Provider value={{ boardSize, setBoardSize }}>
            {children}
        </BoardSizeContext.Provider>
    );
};

export const useBoardSize = () => useContext(BoardSizeContext); 