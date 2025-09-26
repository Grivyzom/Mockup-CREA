import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Evitar que el navegador restaure automáticamente el scroll en recargas/entradas
try { if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; } } catch {}

bootstrapApplication(App, appConfig)
  .then(() => {
    // Garantizar posición inicial arriba tras bootstrap
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  })
  .catch((err) => console.error(err));
