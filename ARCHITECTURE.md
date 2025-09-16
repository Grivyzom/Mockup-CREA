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

- `app.css`: layout principal, márgenes/anchos de `main` y `footer` según sidebar
- `home.css`: grilla responsive + carrusel móvil, chips y dropdown de áreas, efectos glass, badges
- `project-modal.css`: backdrop blur, animaciones, chips por área y botón INACAP
- `project-detail.css`: animaciones de entrada, chips, botones, scrollbars personalizados

## Interacciones y estados

- Click afuera para cerrar dropdowns en Home y Sidebar
- Bloqueo de scroll del body cuando el modal está abierto
- Carrusel auto-advance sólo en móviles y respeta `prefers-reduced-motion`

## Decisiones de diseño

- Componentes standalone para simplicidad (sin NgModules)
- Estilos CSS utilitarios + clases propias para control fino (sin Tailwind en runtime)
- Datos mock en componentes para desarrollo rápido; abstraer a servicio más adelante

## Próximos pasos sugeridos

- Extraer `ProjectData` y utilidades a un `project.model.ts` y `project.utils.ts`
- Crear `ProjectService` que provea datos (HTTP + caching)
- Agregar tests de componentes (modal, home, detail)
- Internacionalización (i18n) de labels
- Accesibilidad: roles ARIA en modal y dropdowns
