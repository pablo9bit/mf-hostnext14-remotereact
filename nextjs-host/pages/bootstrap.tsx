import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useAppContext } from '../src/context/AppContext';

// Declaración de tipos para Module Federation
declare global {
  interface Window {
    remote: any;
  }
}

const Home: NextPage = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isRemoteReady, setIsRemoteReady] = useState(false);
  const [RemoteButton, setRemoteButton] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  // Usar el contexto
  const { counter, message } = useAppContext();
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    const loadRemoteComponent = async () => {
      try {
        // Esperar a que el contenedor remoto esté disponible
        let retries = 0;
        while (!window.remote && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 300));
          retries++;
        }

        if (!window.remote) {
          setError('Remote container not available');
          return;
        }

        // Inicializar el contenedor
        // @ts-ignore
        await window.remote.init(__webpack_share_scopes__.default);
        
        // Obtener el módulo Button
        const factory = await window.remote.get('./Button');
        const Module = factory();
        
        setRemoteButton(() => Module.default);
        setIsRemoteReady(true);
        console.log('Remote component loaded successfully');
      } catch (err: any) {
        console.error('Error loading remote component:', err);
        setError(err.message || 'Failed to load remote component');
      }
    };

    loadRemoteComponent();
  }, []);

  const handleRemoteClick = () => {
    setClickCount(prev => prev + 1);
    alert(`Remote button clicked! Count: ${clickCount + 1}`);
  };

  return (
    <>
      {/* Script tag para cargar el remoto */}
      <script src="http://localhost:3021/remoteEntry.js" async />
      
      <div style={{
        minHeight: '100vh',
        padding: '40px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          color: '#333'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Next.js 14 Host Application
          </h1>
          <p style={{ 
            color: '#666', 
            marginBottom: '30px',
            fontSize: '1.1rem'
          }}>
            Using Module Federation to load remote React components
          </p>

          <div style={{
            background: '#f5f5f5',
            padding: '30px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '15px',
              color: '#333'
            }}>
              Remote Component from react-remote
            </h2>
            <p style={{ 
              color: '#666', 
              marginBottom: '20px',
              fontSize: '0.95rem'
            }}>
              This button is loaded dynamically from the remote React application running on port 3001
            </p>
            
            {error ? (
              <div style={{ padding: '12px 24px', color: 'red', background: '#ffe6e6', borderRadius: '4px' }}>
                Error: {error}
              </div>
            ) : isRemoteReady && RemoteButton ? (
              <RemoteButton 
                label={`Remote Button (Clicks: ${clickCount})`}
                onClick={handleRemoteClick}
                variant="primary"
              />
            ) : (
              <div style={{ padding: '12px 24px', color: '#666' }}>
                Initializing remote module...
              </div>
            )}
          </div>

          <div style={{
            background: '#e8f4f8',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #b8dce8',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              marginBottom: '10px',
              color: '#0070f3'
            }}>
              ✅ Module Federation Active
            </h3>
            <ul style={{ 
              color: '#555',
              lineHeight: '1.8',
              paddingLeft: '20px'
            }}>
              <li>Next.js 14.2.25 (Pages Router)</li>
              <li>TypeScript enabled</li>
              <li>Remote: React 18.2.0 vanilla app</li>
              <li>Shared dependencies: React & React-DOM (singleton)</li>
            </ul>
          </div>

          <div style={{
            background: '#fff3e0',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ffb74d',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              marginBottom: '15px',
              color: '#f57c00'
            }}>
              🎯 Context Demo
            </h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Estado compartido desde el Context: <strong>"{message}"</strong> | Contador: <strong>{counter}</strong>
            </p>
            <a 
              href="/remote-module"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '1rem',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Ver Demo de Context Compartido →
            </a>
            <p style={{ 
              marginTop: '10px', 
              fontSize: '0.85rem', 
              color: '#666' 
            }}>
              Estado compartido entre Next.js Host y React Remote
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
