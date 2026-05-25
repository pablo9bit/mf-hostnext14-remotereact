/// <reference types="react" />

declare module 'remote/Button' {
  import { ButtonProps } from '../components/Button';
  const Button: React.FC<ButtonProps>;
  export default Button;
  export type { ButtonProps };
}
