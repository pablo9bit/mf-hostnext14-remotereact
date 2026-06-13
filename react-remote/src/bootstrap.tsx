import React from 'react';
import ReactDOM from 'react-dom/client';
import StandaloneRemote from './components/StandaloneRemote';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <StandaloneRemote />
  </React.StrictMode>
);
