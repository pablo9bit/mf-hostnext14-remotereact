import React from 'react';
import ReactDOM from 'react-dom/client';
import Button from './components/Button';

const App: React.FC = () => {
  const handleClick = () => {
    alert('Button clicked from Remote App!');
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center' 
    }}>
      <h1 style={{ color: '#0070f3' }}>React Remote App</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        This is a standalone React app that exposes components via Module Federation
      </p>
      <Button 
        label="Click Me (Remote)" 
        onClick={handleClick}
        variant="primary"
      />
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
