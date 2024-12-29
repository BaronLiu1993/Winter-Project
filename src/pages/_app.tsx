import { GlobalZIndexProvider } from "../contexts/GlobalZIndexContext";
import "../styles/globals.css";
import { ConnectionProvider } from '../contexts/ConnectionContext';

import type { AppProps } from "next/app";
import { BoardSizeProvider } from "../contexts/BoardSizeContext";
import { NodesProvider } from "../contexts/NodesContext";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalZIndexProvider>
      <ConnectionProvider>
        <BoardSizeProvider>
          <NodesProvider>
            <Component {...pageProps} /> 
          </NodesProvider>
        </BoardSizeProvider>
      </ConnectionProvider>
    </GlobalZIndexProvider>
  );
}

