# Documentación funcional de la vista /about (Projects)

## Propósito
Pantalla para:
1. Onboarding (estado vacío) al no existir proyectos.
2. Gestión y exploración de proyectos existentes (búsqueda, orden, edición inline, eliminación con modal, lazy loading, progreso y miembros).

---

## Estructura principal

| Bloque | Selector / Marca | Función |
|--------|------------------|---------|
| Wrapper | `<div class="min-h-screen ...">` | Layout general + tema claro. |
| Contenedor | `<div class="max-w-5xl mx-auto px-8">` | Centrado y ancho máximo. |
| Estado vacío | `*ngIf="showEmptyState()"` | Presenta plantillas y CTA de creación vacía. |
| Grid de plantillas | `<div class="template-grid" role="list">` | Selección de una plantilla (crea contexto para formulario). |
| Contenido normal | `<ng-template #normalContent>` | Vista principal cuando ya hay proyectos o se superó el primer uso. |
| Barra de gestión | Flex con título, búsqueda, orden y botón “New empty”. |
| Región aria-live | `<p class="sr-only" aria-live="polite">` | Anuncia número de resultados filtrados. |
| Grid de proyectos | `<div class="grid ...">` | Lista paginada/lazy de tarjetas. |
| Tarjeta de proyecto | `.proj-card-light` (ngFor) | Item interactivo (abrir, editar, eliminar). |
| Formulario edición inline | `#editForm` (ng-template) | Modifica título / descripción sin navegar. |
| Barra de progreso | `.progress-wrap` | Visualiza porcentaje completado. |
| Indicador de miembros | SVG + número | Muestra miembros asociados. |
| Sentinel lazy load | `<div #sentinel *ngIf="...">` | Dispara carga incremental (IntersectionObserver). |
| Modal confirmación | `.modal-overlay` | Elimina proyectos con focus trap. |

---

## Directivas y binding Angular

- *ngIf / *ngFor: Renderizado condicional y repetición.
- `[value]` + `(input)`: Búsqueda y edición controladas por signals.
- `[ngClass]`: Color dinámico de íconos de plantillas.
- Eventos: `(click)`, `(keyup.enter)`, `(keyup.space)` para accesibilidad teclado.
- Signals (referenciadas en template):  
  - `showEmptyState()`, `templates`  
  - `query()`, `sortMode()`  
  - `filteredProjects()`, `visibleProjects()`  
  - `editingId()`, `editTitle()`, `editDescription()`  
  - `animateFromIndex()`, `highlightNewId()`  
  - `confirmDeleteId()`, `confirmDeleteName()`

---

## Accesibilidad (A11y)

| Elemento | Implementación |
|----------|----------------|
| Lista de plantillas | `role="list"` y cada ítem `role="listitem"`, navegación con Enter/Espacio. |
| Tarjeta de proyecto | `tabindex="0"` + `role="button"` + handlers teclado. |
| Progreso | `role="progressbar"` + `aria-valuenow/min/max`. |
| Conteo de resultados | `aria-live="polite"` (solo texto para lectores). |
| Modal | `role="dialog"` + `aria-modal="true"` + focus trap + Escape. |
| Botones iconográficos | `aria-label` descriptivo. |
| Miembros | Texto junto a ícono (no depende solo del SVG). |

---

## Sub‑secciones de la tarjeta de proyecto

1. Encabezado: título + badge TEMPLATE (condicional).
2. Descripción truncada: `.line-clamp-2`.
3. Progreso: barra + porcentaje.
4. Meta secundaria: miembros + grupo de acciones.
5. Acciones:
   - Ver: abre detalle (`openProject(p)`).
   - Editar: inicia modo edición (`beginEdit(p)`).
   - Eliminar: abre modal (`openDelete(p)`).
6. Modo edición: inputs controlados por signals + botones Save / Cancel.

---

## Lazy Loading

- `visibleProjects()` controla el subset mostrado.
- `#sentinel` se observa con IntersectionObserver para invocar `loadMore()`.
- El observer se desconecta cuando todos los filtrados están visibles y se reconecta si cambian filtros y vuelven a faltar items.
- Animaciones de entrada: clase `item-enter` + variable CSS `--stagger-index`.

---

## Modal de eliminación

| Aspecto | Descripción |
|---------|-------------|
| Apertura | `openDelete(p)` fija `confirmDeleteId`. |
| Focus inicial | `#modalPanel` (tabindex="-1"). |
| Trap | Ciclo de Tab / Shift+Tab dentro del panel. |
| Escape | Cierra modal (handler keydown). |
| Confirmar | `confirmDelete()` → elimina proyecto y actualiza persistencia. |
| Cancelar | `closeDelete()`. |

---

## Progreso y miembros

- Barra:
  - Contenedor `.progress-wrap` (posición relativa).
  - Relleno `.progress-bar` con ancho dinámico en `%`.
  - Texto superpuesto `.progress-text`.
- Miembros:
  - Ícono (SVG de usuarios) seguido de `{{ p.members }}`.
  - Ubicado dentro de barra meta inferior.

---

## Extensibilidad sugerida (nombres de posibles componentes)

| Propuesta | Responsabilidad |
|-----------|-----------------|
| `<app-projects-empty-state>` | Estado vacío y grid de plantillas. |
| `<app-projects-toolbar>` | Búsqueda, orden y CTA. |
| `<app-project-card>` | Render y lógica (edición, progreso, acciones). |
| `<app-delete-dialog>` | Modal genérico de confirmación. |
| `<app-progress-bar>` | Barra reutilizable (accepts `value`, `label`). |

---

## Eventos clave (flujo)

1. Plantilla seleccionada → `useTemplate(t)` → marca plantilla pendiente → navegación a creación.
2. Creación exitosa → servicio agrega proyecto → /about refleja el nuevo item (opcional highlight).
3. Edición inline → `saveEdit()` actualiza vía servicio.
4. Eliminación → modal → `confirmDelete()` → lista reactiva se actualiza → aria-live anunciaría nuevo conteo.

---

## Convenciones de estilos (resumen)

| Clase | Propósito |
|-------|-----------|
| `proj-card-light` | Contenedor tarjeta base. |
| `is-new` | Resalta nuevo proyecto (animación). |
| `fade-in-item` / `item-enter` | Animación de aparición escalonada. |
| `badge-template-light` | Distintivo de proyecto basado en plantilla. |
| `icon-btn` / `icon-btn.danger` / `.view` | Botones de acción compactos. |
| `progress-wrap` / `progress-bar` / `progress-text` | Barra de progreso interna. |
| `sr-only` | Texto solo accesible. |

---

## Posibles mejoras futuras

- Aria-live adicional al eliminar o crear (mensajes “Proyecto X eliminado/creado”).
- Tooltips accesibles para iconos.
- Extracción a componentes standalone para reducir tamaño de template.
- Modo de selección múltiple (batch delete).
- Métricas adicionales (última actualización, etiquetas, estado).

---

## Resumen rápido

La vista /about combina:
- Estado vacío con plantillas (onboarding).
- Gestión de proyectos con búsqueda, orden, progreso y miembros.
- Edición inline y eliminación segura.
- Lazy loading optimizado y accesible (IntersectionObserver).
- Modal accesible con focus trap.
- Estructura lista para refactor a componentes modulares.

Fin de la documentación. ¿Requieres la misma documentación en un README separado o refactor sugerido? Solo indicar.