# MockupCrea

Aplicación Angular (v20) con componentes standalone, sidebar responsive y un flujo de exploración de proyectos que incluye tarjetas, modal de detalle y página de proyecto completo.

Para una visión técnica profunda de la arquitectura, lógica y decisiones, ver `ARCHITECTURE.md`.

## Ejecutar en desarrollo

1) Instalar dependencias (una vez):

```bash
npm install
```

2) Levantar el servidor de desarrollo:

```bash
npm start
```

La app se sirve en `http://localhost:4200/` y recarga automáticamente al guardar cambios.

## Build de producción

```bash
npm run build
```

Los artefactos quedan en `dist/`. La configuración utiliza Angular CLI 20.

## Estructura clave

- `src/app/app.ts` y `app.html`: Shell principal con `<app-sidebar>`, `<router-outlet>` y `<app-footer>`
- `src/app/app.routes.ts`: Definición de rutas
- `src/app/pages/home/*`: Dashboard de proyectos mensuales (grilla/cards + "Ver más")
- `src/app/components/project-modal/*`: Modal para ver detalle resumido de un proyecto
- `src/app/pages/project-detail/*`: Página con toda la información del proyecto
- `src/app/components/*`: Sidebar, Footer, ScrollToTop, Navbar/Header
- `src/app/app.css`: Layout global y adaptación al sidebar

## Rutas

- `/home`: Lista de proyectos del mes
- `/proyecto/:id`: Detalle completo del proyecto
- `/about`, `/contact`: Páginas auxiliares
- Redirecciones: `'' → /home`, `** → NotFound`

## Flujo de proyectos

1) En Home, cada card muestra área, duración, estudiantes, dificultad y un botón "Ver más".

2) Al hacer clic en "Ver más" se abre un modal con:

	- Banner del proyecto (color e ícono por área)
	- Título y descripción
	- Miembros y carreras involucradas (chips)
	- Estado + barra de progreso
	- Botón "Ver proyecto completo" → navega a `/proyecto/:id`

3) La página de detalle muestra toda la información estructurada en un layout 2/3 + 1/3.

## Estilos

Se combinan utilidades estilo Tailwind con CSS propio para chips, glass-effect, grillas y animaciones. El footer y el contenido se adaptan al ancho del sidebar en desktop con `margin-left: 16rem` y `width: calc(100% - 16rem)`.

## Scripts disponibles

- `npm start`: Servidor de desarrollo
- `npm run build`: Build de producción
- `npm test`: Tests unitarios (Karma)

## Notas

- Los datos de proyectos están mockeados en los componentes para desarrollo. En producción se recomienda migrarlos a un servicio HTTP y compartir el modelo `ProjectData`.
- El modal bloquea el scroll del body mientras está abierto y se cierra con click en el backdrop o en el botón de cerrar.
