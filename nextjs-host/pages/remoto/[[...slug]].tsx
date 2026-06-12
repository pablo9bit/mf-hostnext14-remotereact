import type { ComponentType } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

declare global {
  interface Window {
    remote: any;
  }
}

declare const __webpack_share_scopes__: {
  default?: unknown;
};

type RemoteAppProps = {
  initialPath?: string;
  hostPath?: string;
  onNavigate?: (path: string) => void;
};

type RemoteAppComponent = ComponentType<RemoteAppProps>;

const normalizePath = (path?: string): string => {
  if (!path) return '/';

  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const normalized = withLeadingSlash.replace(/\/+/g, '/');

  if (normalized.length > 1 && normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }

  return normalized || '/';
};

const getPathFromSlug = (slug: string[] | string | undefined): string => {
  if (!slug) return '/';

  const joined = Array.isArray(slug) ? slug.join('/') : slug;
  return normalizePath(joined);
};

const RouteRemotePage: NextPage = () => {
  const router = useRouter();
  const [RemoteApp, setRemoteApp] = useState<RemoteAppComponent | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const remotePath = useMemo(
    () => getPathFromSlug(router.query.slug as string[] | string | undefined),
    [router.query.slug]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;

    const loadRemoteApp = async () => {
      try {
        let retries = 0;

        while (!window.remote && retries < 20) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          retries += 1;
        }

        if (!window.remote) {
          throw new Error('Remote container "remote" not available on http://localhost:3021');
        }

        const remoteContainer = window.remote as {
          init: (shareScope: unknown) => Promise<void>;
          get: (module: string) => Promise<() => { default: ComponentType<any> }>;
        };

        await remoteContainer.init(__webpack_share_scopes__?.default);
        const factory = await remoteContainer.get('./RemoteApp');
        const module = factory();

        if (!mounted) return;

        setRemoteApp(() => module.default);
        setError('');
      } catch (loadError: any) {
        if (!mounted) return;
        setError(loadError?.message || 'Failed to load remote route app');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadRemoteApp();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRemoteNavigate = useCallback(
    (path: string) => {
      const normalized = normalizePath(path);
      const hostTarget = normalized === '/' ? '/remoto' : `/remoto${normalized}`;
      const currentHostPath = router.asPath.split('?')[0];

      if (currentHostPath !== hostTarget) {
        router.push(hostTarget);
      }
    },
    [router]
  );

  return (
    <>
      <script src="http://localhost:3021/remoteEntry.js" async />
      <main style={{ minHeight: '100vh', background: '#f1f5f9', padding: 20 }}>
        <div style={{ maxWidth: 1024, margin: '0 auto' }}>
          <div
            style={{
              marginBottom: 16,
              borderRadius: 12,
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              background: 'white',
            }}
          >
            <strong>Host route:</strong> {router.asPath} <br />
            <strong>Remote route:</strong> {remotePath}
          </div>

          {error ? (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#991b1b',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <h2 style={{ marginTop: 0 }}>Error al cargar remoto</h2>
              <p style={{ marginBottom: 0 }}>{error}</p>
            </div>
          ) : null}

          {!error && isLoading ? (
            <div
              style={{
                borderRadius: 12,
                padding: 24,
                border: '1px solid #cbd5e1',
                background: 'white',
              }}
            >
              Cargando app remota...
            </div>
          ) : null}

          {!error && RemoteApp ? (
            <RemoteApp
              initialPath={remotePath}
              hostPath={remotePath}
              onNavigate={handleRemoteNavigate}
            />
          ) : null}
        </div>
      </main>
    </>
  );
};

export default RouteRemotePage;
