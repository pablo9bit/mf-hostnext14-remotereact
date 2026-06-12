/// <reference types="react" />

declare module 'remote/Button' {
  export interface ButtonProps {
    label?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  }
  
  const Button: React.FC<ButtonProps>;
  export default Button;
}

declare module 'remote/RemoteApp' {
  export interface RemoteAppProps {
    initialPath?: string;
    hostPath?: string;
    onNavigate?: (path: string) => void;
  }

  const RemoteApp: React.FC<RemoteAppProps>;
  export default RemoteApp;
}

declare module 'remotenext14/MainPage' {
  const MainPage: React.ComponentType<any>;
  export default MainPage;
}