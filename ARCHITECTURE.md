# Arquitectura y Lógica de la Aplicación

Este documento describe la arquitectura, rutas, componentes, estados y flujos principales de la aplicación MockupCrea.

## Stack y convenciones

- Framework: Angular 20 (standalone components)
- Router: @angular/router 20
- Estilos: CSS utilitario inspirado en Tailwind + estilos propios (chips, glass, grids)
- Build: @angular/cli 20
- Estructura: Componentes standalone (sin NgModules), rutas declarativas en `app.routes.ts`

## Estructura de carpetas relevante

- `src/app/app.ts` (App root) y `src/app/app.html` (shell con Sidebar, RouterOutlet, Footer)
- `src/app/app.routes.ts` (definición de rutas)
- `src/app/components/*` (componentes reutilizables: sidebar, footer, scroll-to-top, modal)
- `src/app/pages/*` (páginas enrutadas: home, about, contact, project-detail, not-found)
- `src/app/app.css` (layout global: márgenes respecto al sidebar, footer adaptativo)

## Rutas

Definidas en `src/app/app.routes.ts`:

- `/home` → `Home` (dashboard de proyectos mensuales)
- `/proyecto/:id` → `ProjectDetail` (página detallada del proyecto)
- `/about` → `About`
- `/contact` → `Contact`
- Redirecciones: `'' → /home`, `** → NotFound`

## Shell de la app

`app.html` monta la estructura persistente de la UI:

- `<app-sidebar>`: navegación lateral responsive con dropdowns (notificaciones y perfil)
- `<router-outlet>`: área de contenido para páginas
- `<app-footer>`: pie de página adaptativo que respeta el ancho del sidebar en desktop
- `<app-scroll-to-top>`: botón para volver arriba

El CSS global (`app.css`) ajusta `margin-left` y `width` de `main` y `app-footer` con `calc(100% - 16rem)` en desktop, evitando solaparse con el sidebar.

## Página Home (Proyectos mensuales)

Archivo: `pages/home/*`

- Presenta una grilla responsiva de tarjetas de proyectos (`monthlyProjects`)
- Grilla desktop centrada con `auto-fit` y carrusel 1x1 en móvil (scroll + snap)
- Tarjeta:
  - Banner con color/ícono por área (`getAreaColor`, `getAreaIcon`)
  - Chips de áreas con dropdown (un chip visible + botón `+` para ver todas)
  - Título, descripción, badges de dificultad y "Ver más"
- Dropdown de áreas: hover abre, click en `+` fija; click-afuera cierra
- Accesibilidad: se deshabilita selección de texto para evitar seleccionados accidentales en el carrusel
- Lógica de carrusel móvil: `ngAfterViewInit` inicia auto-advance en móviles y se pausa con interacción; se limpia en `ngOnDestroy`

Estados clave en `Home`:

- `areasDropdownOpenId: number | null`
- `isModalOpen: boolean`
- `selectedProject: ProjectData | null`

Acciones:

- `(click) "Ver más"` → `openProjectModal(project)` abre modal
- Cerrar modal → `closeProjectModal()` (restaura scroll del body)

## Modal de Proyecto (`components/project-modal`)

- Props: `isOpen`, `project: ProjectData | null`
- Eventos: `closeModal`
- Vista:
  - Banner (gradiente por área, icono, dificultad, duración, estudiantes)
  - Secciones: título + descripción, miembros, carreras involucradas (chips), estado + barra de progreso, descripción detallada
  - Footer con botón "Ver Proyecto Completo" → navega a `/proyecto/:id`
- UX: backdrop con blur, animaciones `fadeIn/slideUp`, cierre por backdrop/cerrar

`ProjectData` (shape):

```ts
{
  id: number;
  title: string;
  description: string;
  area: string;            // clave de área (informatica, diseño, ...)
  areaDisplay: string;     // etiqueta legible
  areas: string[];         // chips involucradas
  duration: string;
  difficulty: string;
  students: number;
  members?: string[];
  status: string;          // En progreso | Completado | Pausado | Cancelado
  progress: number;        // 0..100
  fullDescription?: string;
  technologies?: string[];
  objectives?: string[];
  startDate?: string;      // ISO
  endDate?: string;        // ISO
}
```

Utilidades incluidas:

- `getAreaColor`, `getAreaIcon`, `getAreaLabel`, `getStatusColor` (consistentes con Home/Detail)

## Página de Detalle (`pages/project-detail`)

- Ruta: `/proyecto/:id`
- Carga el `id` desde `ActivatedRoute` y busca datos demo en `projectsData`
- Hero con banner grande, acciones (volver, like/share placeholders), badges de estado/dificultad
- Contenido en grid 2/3 + 1/3:
  - Columna principal: descripción completa, objetivos, tecnologías
  - Sidebar: información general, estado + barra de progreso, carreras, equipo
- Estados de carga y de error (si `id` no existe → redirect `/`)

Nota: en producción, `projectsData` vendría de un servicio/HTTP y se compartiría entre Home y Detail.

## Sidebar (`components/sidebar`)

- Responsive: menú móvil y desktop fijo (16rem)
- Dropdowns de notificaciones y perfil con dos modos: hover abre, click fija; click-afuera los cierra
- Escucha `NavigationEnd` para actualizar `pageTitle`
- Acción demo "Iniciar proyecto" con simulación de proceso

## Footer (`components/footer`)

- Adaptativo a sidebar en desktop: `margin-left: 16rem`, `width: calc(100% - 16rem)`
- Z-index bajo el sidebar para no solaparlo; estilos responsivos

## Estilos y layout global


## Interacciones y estados


## Decisiones de diseño


## Próximos pasos sugeridos


## UI Global: Toast, Push Notifications y Modal/Dialog

Se añadieron tres componentes reutilizables montados de forma global en `app.html`:

### Toast (`components/ui/toast`)
- Servicio: `ToastService` (`show(opts)`, `dismiss(id)`, `clear()`).
- API `show` acepta: `message`, `type: 'info'|'success'|'warning'|'error'`, `duration` (ms, default 4000), `action` opcional (botón con callback), `dismissible`.
- Contenedor: `<app-toast-container>` anclado arriba/derecha. Usa Angular signals para reaccionar.
- Uso rápido:
```ts
toast.show({ message: 'Guardado', type: 'success' });
```

### Push Notification (`components/ui/push`)
- Pensado para notificaciones más ricas (título + cuerpo + acciones) estilo "in-app notice" (esquina inferior derecha / móvil full width).
- Servicio: `PushNotificationService` (`show`, `dismiss`, `clear`).
- API `show`: `title`, `message`, `icon?`, `timeout` (default 8000, 0 = sticky), `actions[]` (cada una con `label`, `primary?`, `onClick`), `type`, `dismissible`.
- Acciones cierran la notificación tras ejecutar su callback (se puede impedir retornando `false` o usando lógica adicional).

### Modal/Dialog (`components/ui/modal`)
- Servicio: `ModalService` (`open(config)`, `close(id?)`). Solo un modal activo (simple overlay). Ampliable a stack si se requiere.
- Config `ModalConfig`:
  - `title?`, `content?` (string simple por ahora), `width: 'sm'|'md'|'lg'|'xl'` (default `md`), `closable`, `backdropClose`, `buttons[]`.
  - Cada botón: `label`, `variant: primary|secondary|danger|ghost`, `action` (puede retornar `false` o `Promise` que resuelva `false` para evitar cierre), `closeOnClick` (default true).
- Focus trap básico + restauración del foco anterior al cerrar.
- Escape cierra si `closable`.

### Estilos y Tema INACAP
- Colores y elevaciones reutilizan variables `--inacap-*` existentes (superficies elevadas, bordes, sombras).
- Componentes usan animaciones suaves con cubic-bezier y opacidad + translate.

### Próximas mejoras (pendientes opcionales)
- Modal: soporte para proyección de contenido Angular (portal) y formularios internos.
- Toast: colas con límite y compactación.
- Push: agrupar notificaciones por categoría / canal.

### Ejemplos de integración (no ejecutados aún)
```ts
// Toast
toast.show({ message: 'Perfil actualizado', type: 'success' });

// Push
push.show({
  title: 'Nuevo mensaje',
  message: 'Tienes un comentario en tu proyecto',
  type: 'info',
  actions: [
    { label: 'Ver', primary: true, onClick: () => router.navigate(['/proyecto', 12]) },
    { label: 'Ignorar', onClick: () => {} }
  ]
});

// Modal
modal.open({
  title: 'Eliminar recurso',
  content: '¿Seguro que deseas eliminarlo? Esta acción no se puede deshacer.',
  width: 'sm',
  buttons: [
    { label: 'Cancelar', variant: 'secondary' },
    { label: 'Eliminar', variant: 'danger', action: () => {/* llamar servicio */} }
  ]
});
```

Los tres servicios son singleton `providedIn: 'root'`, por lo que pueden inyectarse desde cualquier componente/página.
