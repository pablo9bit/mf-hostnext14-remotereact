# Guía de Ruteo

## Arquitectura general

El proyecto utiliza dos aplicaciones con sus propios sistemas de ruteo, conectadas mediante Module Federation:

| Aplicación | Framework | Router | Puerto |
|---|---|---|---|
| `nextjs-host` | Next.js 14 | Pages Router (file-system) | 3000 |
| `react-remote` | React 18 + Webpack 5 | React Router 6 | 3021 |

El remoto opera en dos modos mutuamente excluyentes: **aislado** (standalone) y **montado** (embedded). La detección del modo se hace en `RemoteRouter.tsx` evaluando si recibe props de ruteo:

```tsx
const isEmbedded = !!(props.initialPath || props.hostPath || props.onNavigate);
```

---

## Host: `nextjs-host` (Next.js 14 Pages Router)

### Rutas

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `pages/index.tsx` → `pages/bootstrap.tsx` | Home. Carga el componente `Button` del remoto. Enlace a `/remote-module`. |
| `/remote-module` | `pages/remote-module.tsx` | Demostración de contexto compartido. Controles del host (contador y mensaje) que se pasan como props al `Button` remoto. |
| `/remoto/[[...slug]]` | `pages/remoto/[[...slug]].tsx` | **Catch-all**. Monta el router completo del remoto dentro del host. |

### `/remoto/[[...slug]]` — Punto de integración

Esta ruta captura todo path bajo `/remoto` (incluyendo `/remoto`, `/remoto/detalle`, `/remoto/detalle?q=prueba`). Su funcionamiento:

1. Extrae el slug del query param de Next.js y lo normaliza como `remotePath`.
2. Carga `remoteEntry.js` vía `<script>` y espera a que `window.remote` esté disponible (polling cada 300ms, máximo 20 intentos).
3. Inicializa el contenedor con `window.remote.init(__webpack_share_scopes__.default)` y obtiene el módulo `./RemoteApp`.
4. Renderiza `<RemoteApp>`  pasando `initialPath`, `hostPath` y `onNavigate`.

```tsx
<RemoteApp
  initialPath={remotePath}
  hostPath={remotePath}
  onNavigate={handleRemoteNavigate}
/>
```

5. `handleRemoteNavigate` sincroniza la navegación interna del remoto de vuelta al host usando `router.push()`:

```tsx
const handleRemoteNavigate = (path: string) => {
  const normalized = normalizePath(path);
  const hostTarget = normalized === '/' ? '/remoto' : `/remoto${normalized}`;
  router.push(hostTarget);
};
```

Por ejemplo, si el usuario navega a `/detalle` dentro del remoto, el host redirige a `/remoto/detalle`.

---

## Remote: `react-remote` (React Router 6)

### Componentes de ruteo

| Archivo | Propósito |
|---|---|
| `src/components/RemoteRouter.tsx` | Router principal con detección de modo. |
| `src/components/RemoteApp.tsx` | Thin wrapper que delega en `RemoteRouter`. Es el módulo expuesto via Federation (`./RemoteApp`). |
| `src/components/StandaloneRemote.tsx` | Shell para modo aislado. Maneja `popstate` y `pushState`. |

### Vistas compartidas

Ambos modos renderizan las mismas vistas definidas en `RemoteRouter.tsx`:

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `HomeView` | Página de inicio. Botón para navegar a `/detalle`. Soporta query param `?q=...`. |
| `/detalle` | `DetailView` | Página de detalle. Botones para volver a `/` o navegar con `?q=prueba`. |
| *cualquier otra* | `NotFoundView` | Mensaje "Ruta remota no encontrada". |

---

### Modo aislado (standalone)

**Cuándo ocurre**: El remoto se abre directamente en `http://localhost:3021`.

**Flujo**:

1. `public/index.html` carga `main.js` que ejecuta `src/index.ts` → `src/bootstrap.tsx`.
2. `bootstrap.tsx` renderiza `<StandaloneRemote />`.
3. `StandaloneRemote` mantiene el path actual en estado (`browserPath`), escucha eventos `popstate` del navegador, y sobreescribe `pushState` en navegación interna.
4. Pasa `browserPath` como `initialPath` y `hostPath` a `<RemoteApp>`.
5. `RemoteRouter` detecta que NO recibe `onNavigate` (solo recibe `initialPath`/`hostPath` que no propagan `isEmbedded` como `true` en la versión actual — ver sección de Embedded más abajo), y renderiza `<StandaloneRouter>`.
6. `<StandaloneRouter>` envuelve el contenido en `<BrowserRouter>` de React Router 6.

**Árbol de componentes**:
```
<BrowserRouter>
  <RouterInner>
    <HomeView /> o <DetailView /> o <NotFoundView />
  </RouterInner>
</BrowserRouter>
```

---

### Modo montado (embedded)

**Cuándo ocurre**: El remoto se carga dentro del host en `/remoto/[[...slug]]`.

**Flujo**:

1. La página del host carga `./RemoteApp` via Module Federation.
2. El host pasa `initialPath`, `hostPath` y `onNavigate` como props.
3. `RemoteRouter` detecta `isEmbedded = true` (porque al menos una de las tres props está presente) y renderiza `<EmbeddedRouter>`.
4. `<EmbeddedRouter>` renderiza `<EmbeddedContent>` **sin** `<BrowserRouter>`.
5. `EmbeddedContent` usa `hostPath` (prop) en lugar de `location.pathname` para determinar la vista activa.
6. La navegación interna llama a `onNavigate` en lugar de `useNavigate()`, lo que dispara `router.push()` en el host.

**Árbol de componentes**:
```
<EmbeddedContent>    ← Sin BrowserRouter
  <HomeView /> o <DetailView /> o <NotFoundView />
</EmbeddedContent>
```

**Sincronización de ruta**: Cada vez que el usuario hace clic en un enlace dentro del remoto:
1. Se ejecuta `handleNavigate(path)` en `EmbeddedContent`.
2. Se invoca `onNavigateRef.current(path)` que es el callback del host.
3. El host ejecuta `router.push(hostTarget)` actualizando la URL del navegador.
4. El host pasa el nuevo `remotePath` como prop al remoto.
5. `EmbeddedContent` detecta el cambio en `hostPath` y actualiza la vista.

---

### Mapa de decisiones (`RemoteRouter.tsx`)

```
                  ┌─────────────────────────────────────┐
                  │        RemoteRouter (props)          │
                  │  initialPath, hostPath, onNavigate   │
                  └────────────────┬────────────────────┘
                                   │
                          ¿ Alguna prop presente ?
                                   │
                   ┌───────────────┴───────────────┐
                   │                               │
                   │ NO                            │ SÍ
                   │                               │
                   ▼                               ▼
          ┌─────────────────┐            ┌──────────────────┐
          │ StandaloneRouter │            │  EmbeddedRouter   │
          │ <BrowserRouter>  │            │  Sin router       │
          │  RouterInner     │            │  EmbeddedContent  │
          │  usa location    │            │  usa hostPath prop│
          │  useNavigate()   │            │  onNavigate()     │
          └─────────────────┘            └──────────────────┘
```

---

## Flujo de navegación completo

### Aislado: Usuario en `http://localhost:3021/detalle`

```
StandaloneRemote (pushState + popstate)
  └── RemoteApp
       └── RemoteRouter (standalone)
            └── BrowserRouter
                 └── RouterInner
                      └── DetailView
```

### Montado: Usuario en `http://localhost:3000/remoto/detalle`

```
Host: pages/remoto/[[...slug]].tsx
  └── RemoteApp (vía Module Federation)
       └── RemoteRouter (embedded)
            └── EmbeddedContent
                 └── DetailView (hostPath = "/detalle")
```

---

## Detalle técnico: Module Federation

### Consumo del remoto (`nextjs-host/next.config.js`)

```js
remotes: {
  remote: "remote@http://localhost:3021/remoteEntry.js",
}
```

### Exposición del módulo de ruteo (`react-remote/webpack.config.js`)

```js
exposes: {
  './Button': './src/components/Button',
  './RemoteApp': './src/components/RemoteApp',
}
```

### Carga manual (sin `next/dynamic`)

El host usa un patrón de carga manual con script tag + polling + `init()` + `get()`:

```tsx
<script src="http://localhost:3021/remoteEntry.js" async />
```

```tsx
while (!window.remote && retries < 20) {
  await new Promise(resolve => setTimeout(resolve, 300));
  retries++;
}
await window.remote.init(__webpack_share_scopes__.default);
const factory = await window.remote.get('./RemoteApp');
```

Esto es necesario porque `@module-federation/nextjs-mf` presentó problemas de compatibilidad.

---

## Notas importantes

- **`RemoteRouter.tsx`** es el router activo. Separa claramente `EmbeddedContent` (sin hooks de router) de `RouterInner` (con hooks de router dentro de `<BrowserRouter>`).
- **Singleton de React**: Ambos proyectos comparten React como singleton para evitar duplicación de hooks y contexto.
- **`historyApiFallback: true`** en el devServer del remoto permite que las rutas directas (ej: `http://localhost:3021/detalle`) funcionen en modo aislado.
