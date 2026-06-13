import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';

export interface RemoteRouterProps {
  initialPath?: string;
  hostPath?: string;
  onNavigate?: (path: string) => void;
}

// Utility to normalize paths
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

// View Components with query params support
interface RouteViewProps {
  navigate: (path: string) => void;
}

const HomeView: React.FC<RouteViewProps> = ({ navigate }) => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q');

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
        padding: 24,
      }}
    >
      <h2 style={{ marginTop: 0, color: '#0f172a' }}>Inicio remoto</h2>
      <p style={{ color: '#334155' }}>
        El router de React Router 6 está activo. Esta vista corresponde a <strong>/</strong>.
      </p>
      {queryParam && (
        <p style={{ color: '#16a34a', background: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>
          Query parameter: <strong>q={queryParam}</strong>
        </p>
      )}
      <button
        type="button"
        onClick={() => navigate('/detalle')}
        style={{
          display: 'inline-block',
          padding: '10px 16px',
          borderRadius: 8,
          fontWeight: 600,
          color: 'white',
          background: '#0f766e',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Ir a detalle
      </button>
    </div>
  );
};

const DetailView: React.FC<RouteViewProps> = ({ navigate }) => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q');

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
        padding: 24,
      }}
    >
      <h2 style={{ marginTop: 0, color: '#0f172a' }}>Detalle remoto</h2>
      <p style={{ color: '#334155' }}>
        Esta vista la maneja React Router en la subruta <strong>/detalle</strong>.
      </p>
      {queryParam && (
        <p style={{ color: '#16a34a', background: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>
          Query parameter: <strong>q={queryParam}</strong>
        </p>
      )}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            display: 'inline-block',
            padding: '10px 16px',
            borderRadius: 8,
            fontWeight: 600,
            color: 'white',
            background: '#0f766e',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Volver al inicio
        </button>
        <button
          type="button"
          onClick={() => navigate('/detalle?q=prueba')}
          style={{
            display: 'inline-block',
            padding: '10px 16px',
            borderRadius: 8,
            fontWeight: 600,
            color: 'white',
            background: '#1d4ed8',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Con query param
        </button>
      </div>
    </div>
  );
};

const NotFoundView: React.FC<{ path: string; navigate: (path: string) => void }> = ({
  path,
  navigate,
}) => (
  <div
    style={{
      background: 'white',
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      padding: 24,
    }}
  >
    <h2 style={{ marginTop: 0, color: '#7c2d12' }}>Ruta remota no encontrada</h2>
    <p style={{ color: '#7c2d12' }}>
      No existe <strong>{path}</strong> dentro del remoto.
    </p>
    <button
      type="button"
      onClick={() => navigate('/')}
      style={{
        display: 'inline-block',
        padding: '10px 16px',
        borderRadius: 8,
        fontWeight: 600,
        color: 'white',
        background: '#0f766e',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Volver al inicio remoto
    </button>
  </div>
);

// Router content component that handles the two modes
const RouterContent: React.FC<RemoteRouterProps> = ({
  initialPath = '/',
  hostPath = '/',
  onNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const onNavigateRef = useRef(onNavigate);

  // Detect if in embedded mode
  const isEmbedded = useMemo(() => {
    return !!(initialPath || hostPath || onNavigate);
  }, [initialPath, hostPath, onNavigate]);

  // Update ref when onNavigate changes
  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  // Sync hostPath changes to current route
  useEffect(() => {
    if (!isEmbedded) return;

    const normalizedHostPath = normalizePath(hostPath);
    const normalizedCurrentPath = normalizePath(location.pathname);

    if (normalizedHostPath !== normalizedCurrentPath) {
      navigate(normalizedHostPath);
    }
  }, [hostPath, navigate, isEmbedded, location]);

  // Handle internal navigation and call onNavigate callback
  const handleNavigate = (path: string) => {
    const normalizedPath = normalizePath(path);
    navigate(normalizedPath);

    if (isEmbedded && onNavigateRef.current) {
      onNavigateRef.current(normalizedPath);
    }
  };

  // Determine which view to render
  const currentPath = normalizePath(location.pathname);

  return (
    <div
      style={{
        fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: 420,
        padding: 24,
      }}
    >
      <h1 style={{ marginTop: 0, color: '#0f172a' }}>React Router 6 Remote</h1>
      <p style={{ color: '#334155', marginBottom: 20 }}>
        Ruta activa: <strong>{currentPath}</strong>
        {isEmbedded && (
          <span style={{ color: '#7c3aed', marginLeft: '16px' }}>(Modo embebido)</span>
        )}
        {!isEmbedded && <span style={{ color: '#16a34a', marginLeft: '16px' }}>(Modo standalone)</span>}
      </p>

      {currentPath === '/' && <HomeView navigate={handleNavigate} />}
      {currentPath === '/detalle' && <DetailView navigate={handleNavigate} />}
      {currentPath !== '/' && currentPath !== '/detalle' && (
        <NotFoundView path={currentPath} navigate={handleNavigate} />
      )}
    </div>
  );
};

// Main RemoteRouter component
const RemoteRouter: React.FC<RemoteRouterProps> = (props) => {
  const isEmbedded = !!(props.initialPath || props.hostPath || props.onNavigate);

  // In embedded mode, don't render BrowserRouter (it's already provided by the host)
  // Instead, just render the content
  if (isEmbedded) {
    return <RouterContent {...props} />;
  }

  // In standalone mode, provide the BrowserRouter
  return (
    <BrowserRouter>
      <RouterContent {...props} />
    </BrowserRouter>
  );
};

export default RemoteRouter;
