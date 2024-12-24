import { GlobalZIndexProvider } from "../contexts/GlobalZIndexContext";
import "../styles/globals.css";
import { ConnectionProvider } from '../contexts/ConnectionContext';

import type { AppProps } from "next/app";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalZIndexProvider>
      <ConnectionProvider>
        <Component {...pageProps} /> 
      </ConnectionProvider>
    </GlobalZIndexProvider>
  );
}

