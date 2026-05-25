# Guía: Context Compartido entre Next.js Host y React Remote

Esta guía explica paso a paso cómo se comparte estado desde un Context en Next.js hacia componentes remotos usando Module Federation.

## 📋 Índice

1. [Concepto General](#concepto-general)
2. [Implementación del Context](#implementación-del-context)
3. [Configuración del Provider](#configuración-del-provider)
4. [Consumo en Páginas](#consumo-en-páginas)
5. [Paso de Props al Remoto](#paso-de-props-al-remoto)
6. [Limitaciones y Consideraciones](#limitaciones-y-consideraciones)

---

## Concepto General

Module Federation permite compartir componentes entre aplicaciones, pero **no comparte automáticamente el estado** entre ellas. Para compartir estado, usamos el patrón de **props drilling**:

```
Next.js Context → useContext() → Props → Componente Remoto
```

### ¿Por qué no compartir el Context directamente?

Los componentes remotos son **independientes** y no tienen acceso directo al Context del host. Sin embargo, podemos:

1. ✅ Pasar datos del Context como **props**
2. ✅ Pasar callbacks para actualizar el estado del host
3. ❌ No podemos usar `useContext()` directamente en el remoto (vive en otra app)

---

## Implementación del Context

### 1. Crear el Context (`nextjs-host/src/context/AppContext.tsx`)

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  counter: number;
  incrementCounter: () => void;
  decrementCounter: () => void;
  message: string;
  setMessage: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [counter, setCounter] = useState(0);
  const [message, setMessage] = useState('Hola desde Next.js Host!');

  const incrementCounter = () => setCounter(prev => prev + 1);
  const decrementCounter = () => setCounter(prev => prev - 1);

  return (
    <AppContext.Provider value={{
      counter,
      incrementCounter,
      decrementCounter,
      message,
      setMessage,
    }}>
      {children}
    </AppContext.Provider>
  );
};
```

**Puntos clave:**
- Estado centralizado (`counter`, `message`)
- Funciones para actualizar el estado
- Hook personalizado `useAppContext()` para consumir el contexto
- TypeScript para type safety

---

## Configuración del Provider

### 2. Envolver la app con el Provider (`nextjs-host/pages/_app.tsx`)

```tsx
import type { AppProps } from 'next/app';
import { AppProvider } from '../src/context/AppContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;
```

**Resultado:**
- Todas las páginas tienen acceso al Context
- El estado persiste al navegar entre páginas
- Un solo Provider para toda la aplicación

---

## Consumo en Páginas

### 3. Usar el Context en una página (`nextjs-host/pages/remote-module.tsx`)

```tsx
import { useAppContext } from '../src/context/AppContext';

const RemoteModulePage: NextPage = () => {
  // Extraer estado y funciones del Context
  const { counter, incrementCounter, decrementCounter, message, setMessage } = useAppContext();

  return (
    <div>
      {/* Controles del host */}
      <div>
        <p>Contador: {counter}</p>
        <button onClick={decrementCounter}>-</button>
        <button onClick={incrementCounter}>+</button>
        
        <input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      
      {/* ... cargar componente remoto ... */}
    </div>
  );
};
```

**Puntos clave:**
- Hook `useAppContext()` extrae el estado
- Los cambios en los inputs actualizan el Context
- El estado está disponible para pasar al remoto

---

## Paso de Props al Remoto

### 4. Pasar el estado como props al componente remoto

```tsx
const RemoteModulePage: NextPage = () => {
  const { counter, message } = useAppContext();
  const [ButtonComponent, setButtonComponent] = useState<any>(null);

  // Cargar el componente remoto (Module Federation)
  useEffect(() => {
    const loadRemote = async () => {
      await window.remote.init(__webpack_share_scopes__.default);
      const factory = await window.remote.get('./Button');
      const Module = factory();
      setButtonComponent(() => Module.default);
    };
    loadRemote();
  }, []);

  return (
    <div>
      {ButtonComponent && (
        <ButtonComponent 
          label={`${message} - Counter: ${counter}`}
          onClick={() => alert(`Counter: ${counter}`)}
          variant="primary"
        />
      )}
    </div>
  );
};
```

**Flujo:**
1. Se carga el componente remoto dinámicamente
2. Se extraen `counter` y `message` del Context
3. Se pasan como props al componente remoto
4. El componente remoto los recibe y renderiza

### 5. Componente remoto recibe las props (`react-remote/src/components/Button.tsx`)

```tsx
export interface ButtonProps {
  label?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant }) => {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
};
```

**Resultado:**
- El botón remoto muestra el texto del Context
- Al hacer click, ejecuta la función con el contador actual
- Todo es reactivo: si cambia el Context, se actualiza el botón

---

## Limitaciones y Consideraciones

### ✅ Lo que funciona

1. **Props drilling**: Pasar datos del Context como props ✅
2. **Callbacks**: Pasar funciones que actualizan el estado del host ✅
3. **Reactividad**: Los cambios en el Context re-renderizan el componente remoto ✅
4. **TypeScript**: Type safety completo entre host y remoto ✅

### ⚠️ Consideraciones

1. **No acceso directo al Context**: El remoto no puede usar `useAppContext()` directamente
2. **Props explícitas**: Hay que pasar cada dato necesario como prop
3. **Sincronización manual**: Si el remoto necesita actualizar el host, debe recibir callbacks
4. **Rendimiento**: Pasar muchos props puede afectar el rendimiento (usar `memo` si es necesario)

### 🔄 Patrón de actualización bidireccional

Si quieres que el remoto actualice el estado del host:

```tsx
// En el host
<ButtonComponent 
  counter={counter}
  onIncrement={incrementCounter}  // Callback
  onDecrement={decrementCounter}  // Callback
/>

// En el remoto
const Button: React.FC<Props> = ({ counter, onIncrement, onDecrement }) => {
  return (
    <div>
      <button onClick={onDecrement}>-</button>
      <span>{counter}</span>
      <button onClick={onIncrement}>+</button>
    </div>
  );
};
```

---

## 🎯 Resumen

| Aspecto | Implementación |
|---------|----------------|
| **Context** | Se crea en el host (Next.js) |
| **Provider** | Envuelve la app en `_app.tsx` |
| **Consumo** | Hook `useAppContext()` en páginas |
| **Compartición** | Via props al componente remoto |
| **Reactividad** | Automática cuando cambia el Context |
| **Type Safety** | TypeScript en interfaces de props |

---

## 📚 Recursos

- [React Context API](https://react.dev/reference/react/useContext)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Next.js Pages Router](https://nextjs.org/docs/pages)
