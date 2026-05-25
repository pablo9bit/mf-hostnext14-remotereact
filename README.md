# Module Federation: Next.js 14 + React Vanilla con Context Compartido

Demostración de **Module Federation** con un proyecto host Next.js 14 (Pages Router) consumiendo componentes de un proyecto remoto React vanilla, incluyendo **compartición de estado mediante Context API**.

## 🏗️ Arquitectura

```
mf-next14-react/
├── nextjs-host/          # Host: Next.js 14.2.25 con Pages Router
│   ├── pages/            # Pages Router
│   │   ├── _app.tsx      # App wrapper con AppProvider (Context)
│   │   ├── index.tsx     # Home con demos básicas
│   │   └── remote-module.tsx # Demo de Context compartido
│   ├── src/
│   │   ├── context/      # Context API para estado compartido
│   │   │   └── AppContext.tsx
│   │   └── types/        # Type declarations para módulos remotos
│   ├── next.config.js    # Configuración de Module Federation
│   └── package.json
│
└── react-remote/         # Remoto: React 18.2.0 vanilla con webpack
    ├── src/
    │   ├── components/   # Componentes exportados
    │   │   └── Button.tsx # Button con visualización mejorada
    │   ├── bootstrap.tsx # App principal
    │   └── index.ts      # Entry point con carga dinámica
    ├── webpack.config.js # Configuración de Module Federation
    └── package.json
```

## ✨ Características Destacadas

### 🎯 Context API Compartido
El proyecto incluye una demostración de cómo compartir estado desde el host (Next.js) hacia componentes remotos:

- **AppContext** en Next.js con estado global (contador y mensaje)
- **Props drilling** para pasar estado a componentes remotos
- **Actualización en tiempo real** del componente remoto cuando cambia el estado del host

### Demo disponible en:
- **`/`** - Home con overview del proyecto
- **`/remote-module`** - Demo completa de Context compartido

## 🚀 Inicio Rápido

### Opción 1: Ejecutar ambos proyectos simultáneamente

```bash
# Instalar dependencias (si no lo has hecho)
npm install
cd react-remote && npm install
cd ../nextjs-host && npm install
cd ..

# Ejecutar ambos proyectos
npm run dev
```

### Opción 2: Ejecutar proyectos individualmente

**Terminal 1 - Proyecto Remoto:**
```bash
cd react-remote
npm start
# Se ejecuta en http://localhost:3021
```

**Terminal 2 - Proyecto Host:**
```bash
cd nextjs-host
npm run dev
# Se ejecuta en http://localhost:3020
```

## 📋 Requisitos

- Node.js 18+ 
- npm 9+

## 🔧 Tecnologías

### Next.js Host
- **Next.js**: 14.2.25 (Pages Router)
- **React**: 18.2.0
- **TypeScript**: 5.0+
- **@module-federation/nextjs-mf**: ^8.8.25

### React Remote
- **React**: 18.2.0
- **TypeScript**: 5.0+
- **Webpack**: 5.88+
- **Module Federation Plugin**: Integrado en Webpack 5

## 📦 Componentes Expuestos

El proyecto `react-remote` expone:

- **Button** (`remote/Button`): Componente de botón reutilizable con props tipadas
  - Recibe `label`, `onClick` y `variant`
  - Muestra visualización mejorada con gradientes
  - Perfecto para compartir estado desde el host

### Uso Básico en Next.js Host

```tsx
import dynamic from 'next/dynamic';

const RemoteButton = dynamic(() => import('remote/Button'), {
  ssr: false,
});

function Page() {
  return (
    <RemoteButton 
      label="Click Me" 
      onClick={() => alert('Clicked!')}
      variant="primary"
    />
  );
}
```

### Uso con Context Compartido

```tsx
import { useAppContext } from '../src/context/AppContext';

function Page() {
  const { counter, message } = useAppContext();
  
  return (
    <RemoteButton 
      label={`${message} - Counter: ${counter}`}
      onClick={() => alert(`Counter: ${counter}`)}
      variant="primary"
    />
  );
}
```

## 🔍 Verificación

### 1. Remoto funcionando
- Abrir http://localhost:3021
- Deberías ver la aplicación React standalone

### 2. remoteEntry.js disponible
- Abrir http://localhost:3021/remoteEntry.js
- Deberías ver código JavaScript (bundle de Module Federation)

### 3. Host consumiendo remoto
- Abrir http://localhost:3020
- Deberías ver el componente Button cargado desde el remoto
- Verificar en DevTools (Network tab) que `remoteEntry.js` se carga desde `localhost:3021`

## ⚙️ Configuración Module Federation

### React Remote (webpack.config.js)

```javascript
new ModuleFederationPlugin({
  name: 'remote',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
  },
})
```

### Next.js Host (next.config.js)

✅ **Context API** - Estado compartido entre host y remoto  
✅ **Props drilling** - Paso de estado del contexto a componentes remotos  
✅ **Actualización reactiva** - Cambios en el contexto se reflejan en el remoto  

## 🎨 Context API - Compartición de Estado

El proyecto incluye un **AppContext** que demuestra cómo compartir estado entre el host (Next.js) y componentes remotos:

### Estructura del Context

```tsx
// nextjs-host/src/context/AppContext.tsx
interface AppContextType {
  counter: number;
  incrementCounter: () => void;
  decrementCounter: () => void;
  message: string;
  setMessage: (message: string) => void;
}
```

### Implementación

1. **Provider** envuelve toda la app en `_app.tsx`
2. **Consumer** usa `useAppContext()` en las páginas
3. **Props** se pasan del host al componente remoto
4. **Reactividad** automática cuando cambia el estado

### Flujo de datos

```
AppContext (Next.js) 
    ↓
useAppContext() en páginas
    ↓  
Props al componente remoto
    ↓
Button.tsx renderiza el estado
```
```javascript
new NextFederationPlugin({
  name: 'host',
  remotes: {
    remote: 'remote@http://localhost:3021/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
  },
})
```

## 🎯 Características Clave

✅ **TypeScript completo** en ambos proyectos  
✅ **Type safety** para componentes remotos via `.d.ts`  
✅ **Shared dependencies** (React singleton para evitar duplicados)  
✅ **CSR (Client-Side Rendering)** con `ssr: false`  
✅ **Hot reload** en desarrollo  
✅ **Pages Router** en Next.js  

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Ejecutar host + remote simultáneamente
npm run dev:host         # Solo host (Next.js)
npm run dev:remote       # Solo remote (React)

# Build
npm run build            # Build ambos proyectos
npm run build:host       # Build solo host
npm run build:remote     # Build solo remote

# Type checking
npm run type-check       # Verificar tipos en ambos proyectos
npm run type-check:host
npm run type-check:remote
```

## 🐛 Troubleshooting

### Error: "Shared module is not available"
- Asegúrate de que el proyecto remoto esté ejecutándose en puerto 3021
- Verifica que las versiones de React sean compatibles (`^18.2.0`)

### Error: TypeScript no reconoce 'remote/Button'
- Verifica que `src/types/remote.d.ts` exista en nextjs-host
- Reinicia el servidor TypeScript en VS Code

### Error: remoteEntry.js no se carga
- Verifica CORS (ya configurado en webpack.config.js)
- Asegúrate de que webpack-dev-server esté corriendo en puerto 3021

## 📚 Recursos

- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [Next.js Module Federation Plugin](https://www.npmjs.com/package/@module-federation/nextjs-mf)
- [Webpack 5 Module Federation](https://webpack.js.org/plugins/module-federation-plugin/)

## 📄 Licencia

MIT
