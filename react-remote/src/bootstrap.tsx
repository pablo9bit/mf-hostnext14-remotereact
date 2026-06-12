import React from 'react';
import ReactDOM from 'react-dom/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import RemoteApp from './components/RemoteApp';

const normalizePath = (path?: string): string => {
  if (!path) return '/';
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const normalized = withLeadingSlash.replace(/\/+/g, '/');

  if (normalized.length > 1 && normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }

  return normalized || '/';
};

const App: React.FC = () => {
  const [browserPath, setBrowserPath] = useState(() => normalizePath(window.location.pathname));
  const browserPathRef = useRef(browserPath);

  useEffect(() => {
    browserPathRef.current = browserPath;
  }, [browserPath]);

  useEffect(() => {
    const onPopState = () => {
      const nextPath = normalizePath(window.location.pathname);
      setBrowserPath((previousPath) => (previousPath === nextPath ? previousPath : nextPath));
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    const targetPath = normalizePath(path);
    if (targetPath === browserPathRef.current) {
      return;
    }

    window.history.pushState({}, '', targetPath);
    browserPathRef.current = targetPath;
    setBrowserPath(targetPath);
  }, []);

  return (
    <div style={{ background: '#e2e8f0', minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <p style={{ color: '#0f172a', marginTop: 0 }}>
          Standalone remoto en <strong>http://localhost:3021{browserPath}</strong>
        </p>
        <RemoteApp
          initialPath={browserPath}
          hostPath={browserPath}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
