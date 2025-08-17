/// <reference types="vite/client" />

declare module '*.wasm?url' {
  const path: string;
  export default path;
}