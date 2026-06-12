/// <reference types="react" />

declare module 'remote/Button' {
  import { ButtonProps } from '../components/Button';
  const Button: React.FC<ButtonProps>;
  export default Button;
  export type { ButtonProps };
}

declare module 'remote/RemoteApp' {
  import { RemoteAppProps } from '../components/RemoteApp';
  const RemoteApp: React.FC<RemoteAppProps>;
  export default RemoteApp;
  export type { RemoteAppProps };
}
