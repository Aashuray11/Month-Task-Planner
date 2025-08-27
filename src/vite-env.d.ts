/// <reference types="vite/client" />

// Minimal JSX namespace declarations to prevent TS errors before installing @types/react
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
