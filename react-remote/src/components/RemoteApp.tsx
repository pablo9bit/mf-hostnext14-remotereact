import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface RemoteAppProps {
  initialPath?: string;
  hostPath?: string;
  onNavigate?: (path: string) => void;
}

const normalizePath = (path?: string): string => {
  if (!path) return '/';

  let normalized = path.trim();

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  normalized = normalized.replace(/\/+/g, '/');

  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || '/';
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
  padding: 24,
};

const navButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 16px',
  borderRadius: 8,
  fontWeight: 600,
  color: 'white',
  background: '#0f766e',
  border: 'none',
  cursor: 'pointer',
};

interface RouteViewProps {
  navigate: (path: string) => void;
}

const HomeView: React.FC<RouteViewProps> = ({ navigate }) => (
  <div style={cardStyle}>
    <h2 style={{ marginTop: 0, color: '#0f172a' }}>Inicio remoto</h2>
    <p style={{ color: '#334155' }}>
      El router interno del remoto esta activo. Esta vista corresponde a <strong>/</strong>.
    </p>
    <button type="button" onClick={() => navigate('/detalle')} style={navButtonStyle}>
      Ir a detalle
    </button>
  </div>
);

const DetailView: React.FC<RouteViewProps> = ({ navigate }) => (
  <div style={cardStyle}>
    <h2 style={{ marginTop: 0, color: '#0f172a' }}>Detalle remoto</h2>
    <p style={{ color: '#334155' }}>
      Esta vista la maneja el remoto en la subruta <strong>/detalle</strong>.
    </p>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <button type="button" onClick={() => navigate('/')} style={navButtonStyle}>
        Volver al inicio
      </button>
      <button
        type="button"
        onClick={() => navigate('/detalle/extra')}
        style={{ ...navButtonStyle, background: '#1d4ed8' }}
      >
        Ruta catch-all interna
      </button>
    </div>
  </div>
);

const NotFoundView: React.FC<{ path: string; navigate: (path: string) => void }> = ({
  path,
  navigate,
}) => (
  <div style={cardStyle}>
    <h2 style={{ marginTop: 0, color: '#7c2d12' }}>Ruta remota no encontrada</h2>
    <p style={{ color: '#7c2d12' }}>
      No existe <strong>{path}</strong> dentro del remoto.
    </p>
    <button type="button" onClick={() => navigate('/')} style={navButtonStyle}>
      Volver al inicio remoto
    </button>
  </div>
);

const RemoteApp: React.FC<RemoteAppProps> = ({ initialPath = '/', hostPath = '/', onNavigate }) => {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(initialPath));
  const lastRequestedNavigationRef = useRef<string | null>(null);
  const onNavigateRef = useRef<RemoteAppProps['onNavigate']>(onNavigate);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    const normalizedHostPath = normalizePath(hostPath);
    setCurrentPath((previousPath) =>
      previousPath === normalizedHostPath ? previousPath : normalizedHostPath
    );
  }, [hostPath]);

  useEffect(() => {
    if (!onNavigateRef.current) return;

    const normalizedHostPath = normalizePath(hostPath);
    if (currentPath === normalizedHostPath) {
      lastRequestedNavigationRef.current = null;
      return;
    }

    if (lastRequestedNavigationRef.current === currentPath) {
      return;
    }

    lastRequestedNavigationRef.current = currentPath;

    onNavigateRef.current(currentPath);
  }, [currentPath, hostPath]);

  const navigate = (path: string): void => {
    setCurrentPath(normalizePath(path));
  };

  const view = useMemo(() => {
    if (currentPath === '/') {
      return <HomeView navigate={navigate} />;
    }

    if (currentPath === '/detalle') {
      return <DetailView navigate={navigate} />;
    }

    return <NotFoundView path={currentPath} navigate={navigate} />;
  }, [currentPath]);

  return (
    <div
      style={{
        fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: 420,
        padding: 24,
      }}
    >
      <h1 style={{ marginTop: 0, color: '#0f172a' }}>React Remote Router</h1>
      <p style={{ color: '#334155', marginBottom: 20 }}>
        Ruta activa: <strong>{currentPath}</strong>
      </p>

      {view}
    </div>
  );
};

export default RemoteApp;
