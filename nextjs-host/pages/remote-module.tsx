import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useAppContext } from '../src/context/AppContext';

// Declaración de tipos para Module Federation
declare global {
  interface Window {
    remote: any;
  }
}

const RemoteModulePage: NextPage = () => {
  const [isRemoteReady, setIsRemoteReady] = useState(false);
  const [ButtonComponent, setButtonComponent] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  // Consumir el contexto
  const { counter, incrementCounter, decrementCounter, message, setMessage } = useAppContext();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    const loadRemoteComponent = async () => {
      try {
        // Esperar a que el contenedor remoto esté disponible
        let retries = 0;
        while (!window.remote && retries < 20) {
          await new Promise(resolve => setTimeout(resolve, 300));
          retries++;
        }

        if (!window.remote) {
          setError('Remote container "remote" not available. Make sure the remote is running on http://localhost:3021');
          return;
        }

        // Inicializar el contenedor
        // @ts-ignore
        await window.remote.init(__webpack_share_scopes__.default);
        
        // Obtener el módulo Button
        const factory = await window.remote.get('./Button');
        const Module = factory();
        
        setButtonComponent(() => Module.default);
        setIsRemoteReady(true);
        console.log('Remote Button component loaded successfully');
      } catch (err: any) {
        console.error('Error loading remote component:', err);
        setError(err.message || 'Failed to load remote component');
      }
    };

    loadRemoteComponent();
  }, []);

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
          maxWidth: '1200px',
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
            Remote Module con Context Compartido
          </h1>
          <p style={{ 
            color: '#666', 
            marginBottom: '30px',
            fontSize: '1.1rem'
          }}>
            Estado compartido desde Next.js Host hacia React Remote
          </p>

          {/* Panel de Control del Host */}
          <div style={{
            background: '#f0f4ff',
            padding: '30px',
            borderRadius: '8px',
            marginBottom: '30px',
            border: '2px solid #667eea'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#667eea' }}>
              🎛️ Control del Host (Next.js)
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Contador: <span style={{ color: '#667eea', fontSize: '1.5rem' }}>{counter}</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={decrementCounter}
                  style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  - Decrementar
                </button>
                <button 
                  onClick={incrementCounter}
                  style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: '#28a745',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  + Incrementar
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Mensaje:
              </label>
              <input 
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '2px solid #667eea',
                  boxSizing: 'border-box',
                }}
                placeholder="Escribe un mensaje..."
              />
            </div>
          </div>

          <div style={{
            background: '#f5f5f5',
            padding: '30px',
            borderRadius: '8px',
            marginBottom: '20px',
            minHeight: '200px'
          }}>
            {error ? (
              <div style={{ 
                padding: '20px', 
                color: '#d32f2f', 
                background: '#ffebee', 
                borderRadius: '8px',
                border: '1px solid #ef5350'
              }}>
                <h3 style={{ marginTop: 0, color: '#d32f2f' }}>❌ Error Loading Remote</h3>
                <p style={{ margin: '10px 0', color: '#d32f2f' }}>{error}</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '15px' }}>
                  <strong>Troubleshooting:</strong><br/>
                  • Make sure the remote app is running on http://localhost:3021<br/>
                  • Check that remoteEntry.js is accessible<br/>
                  • Verify the remote name is &quot;remote&quot;
                </p>
              </div>
            ) : isRemoteReady && ButtonComponent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  padding: '10px 20px', 
                  background: '#e8f5e9', 
                  borderRadius: '4px',
                  marginBottom: '30px',
                  color: '#2e7d32',
                  border: '1px solid #81c784'
                }}>
                  ✅ Componente remoto cargado exitosamente
                </div>
                
                <h3 style={{ marginBottom: '20px', color: '#764ba2' }}>
                  🎨 Componente Button desde React Remote
                </h3>
                
                {/* Pasar el estado del contexto como props al componente remoto */}
                <ButtonComponent 
                  label={`${message} - Counter: ${counter}`}
                  onClick={() => alert(`Contador: ${counter}\nMensaje: ${message}`)}
                  variant="primary"
                />
                
                <div style={{ 
                  marginTop: '30px', 
                  padding: '20px', 
                  background: '#fff3cd',
                  borderRadius: '6px',
                  border: '1px solid #ffc107',
                  color: '#856404'
                }}>
                  <strong>💡 Info:</strong> El texto y contador del botón vienen del Context de Next.js
                </div>
              </div>
            ) : (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
                <div style={{ fontSize: '1.2rem' }}>Cargando módulo remoto...</div>
                <div style={{ fontSize: '0.9rem', marginTop: '10px', color: '#999' }}>
                  Intentando conectar con http://localhost:3021
                </div>
              </div>
            )}
          </div>

          <div style={{
            background: '#e3f2fd',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #90caf9'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              marginBottom: '10px',
              color: '#1976d2'
            }}>
              📦 Module Federation Info
            </h3>
            <ul style={{ 
              color: '#555',
              lineHeight: '1.8',
              paddingLeft: '20px',
              margin: 0
            }}>
              <li>Remote Name: <strong>remote</strong></li>
              <li>Remote URL: <strong>http://localhost:3021/remoteEntry.js</strong></li>
              <li>Exposed Module: <strong>./Button</strong></li>
              <li>Estado compartido desde: <strong>AppContext (Next.js)</strong></li>
            </ul>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a 
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ← Volver al Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default RemoteModulePage;
