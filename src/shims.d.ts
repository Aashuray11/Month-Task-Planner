// Temporary shims to quiet TypeScript until dependencies are installed
declare module 'react';
declare module 'react-dom/client';
declare module 'react/jsx-runtime';
declare module 'react/jsx-dev-runtime';
declare module '@vitejs/plugin-react' {
  const plugin: any;
  export default plugin;
}

declare module './App' {
  const C: any;
  export default C;
}
