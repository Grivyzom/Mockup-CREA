# Webkit Scrollbar INACAP - Guía de Uso

## 📋 Descripción
Complemento de scrollbars personalizados que se integra perfectamente con la paleta de colores INACAP, proporcionando una experiencia de usuario consistente y profesional en toda la aplicación web.

## 🎨 Características
- **Integración completa** con la paleta INACAP (rojo #c41e3a, grises, etc.)
- **Múltiples variantes** para diferentes contextos
- **Responsive** con ajustes automáticos para móvil
- **Soporte para dark mode** (preparado para implementación futura)
- **Transiciones suaves** y efectos hover/active

## 🚀 Cómo usar

### 1. Scrollbar por defecto (Global)
Se aplica automáticamente a toda la aplicación:
```html
<!-- No requiere clases adicionales -->
<div style="height: 200px; overflow-y: auto;">
  <!-- Contenido largo que genera scroll -->
</div>
```

### 2. Scrollbar INACAP (Premium)
Para elementos importantes que requieren mayor énfasis:
```html
<div class="scrollbar-inacap" style="height: 300px; overflow: auto;">
  <!-- Lista de proyectos, carrusel, etc. -->
</div>
```

### 3. Scrollbar delgado (Compacto)
Para elementos donde el espacio es limitado:
```html
<div class="scrollbar-thin" style="height: 150px; overflow-y: scroll;">
  <!-- Sidebar, menús desplegables, etc. -->
</div>
```

### 4. Scrollbar invisible (Overlay)
Para elementos donde el scroll debe estar oculto:
```html
<div class="scrollbar-invisible" style="overflow: auto;">
  <!-- Carruseles, galerías horizontales -->
</div>
```

### 5. Scrollbar para formularios
Específico para textareas y campos de formulario:
```html
<textarea class="scrollbar-form" rows="10">
  <!-- Contenido del textarea -->
</textarea>

<div class="form-scrollable" style="height: 200px; overflow: auto;">
  <!-- Lista de opciones en un formulario -->
</div>
```

### 6. Scrollbar para modales
Para contenido de modales y overlays:
```html
<div class="modal-content" style="max-height: 80vh; overflow: auto;">
  <!-- Contenido del modal -->
</div>
```

## 📱 Comportamiento Responsive

### Desktop (>768px)
- Scrollbar estándar: 8px de ancho
- Scrollbar INACAP: 10px de ancho
- Scrollbar delgado: 6px de ancho

### Mobile (≤768px)
- Scrollbar estándar: 12px de ancho (mejor usabilidad táctil)
- Scrollbar INACAP: 14px de ancho
- Scrollbar delgado: 8px de ancho

## 🎯 Casos de uso recomendados

### ✅ Cuándo usar cada variante:

**Scrollbar por defecto:**
- Contenido general de la página
- Elementos sin importancia visual especial

**Scrollbar INACAP (.scrollbar-inacap):**
- Carrusel de proyectos mensuales
- Panel principal de contenido
- Áreas destacadas de la interfaz

**Scrollbar delgado (.scrollbar-thin):**
- Sidebar de navegación
- Menús desplegables
- Listas compactas

**Scrollbar invisible (.scrollbar-invisible):**
- Carruseles horizontales con navegación por botones
- Galerías de imágenes
- Elementos donde el scroll debe ser discreto

**Scrollbar para formularios (.scrollbar-form):**
- Textareas de descripción de proyectos
- Campos de texto largos
- Áreas de comentarios

**Scrollbar para modales (.modal-content):**
- Ventanas emergentes
- Formularios de creación de proyectos
- Overlays informativos

## 🔧 Personalización

Para crear variantes adicionales, usa las variables CSS INACAP:

```css
.mi-scrollbar-custom::-webkit-scrollbar {
  width: 10px;
}

.mi-scrollbar-custom::-webkit-scrollbar-thumb {
  background: var(--inacap-red);
  border-radius: 5px;
}

.mi-scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: var(--inacap-red-hover);
}
```

## 🌙 Dark Mode
El complemento incluye soporte para dark mode usando `prefers-color-scheme: dark`. Se activará automáticamente cuando el usuario tenga configurado el modo oscuro en su sistema.

## ⚠️ Compatibilidad
- ✅ Chrome/Safari/Edge (webkit)
- ✅ Firefox (fallback con `scrollbar-width`)
- ✅ IE/Edge legacy (fallback con `-ms-overflow-style`)

## 📝 Ejemplo completo
```html
<!-- En el formulario de creación de proyectos -->
<div class="card-inacap">
  <div class="scrollbar-inacap" style="max-height: 400px; overflow-y: auto;">
    <!-- Lista de carreras -->
    <div *ngFor="let carrera of carrerasDisponibles">
      {{ carrera }}
    </div>
  </div>
  
  <textarea 
    class="scrollbar-form" 
    formControlName="descripcion" 
    rows="8"
    placeholder="Describe tu proyecto...">
  </textarea>
</div>
```

¡Disfruta de una experiencia de scroll más elegante y alineada con la identidad visual INACAP! 🎉