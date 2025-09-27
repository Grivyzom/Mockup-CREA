import { Component, signal } from '@angular/core';
import { AccessibilityService } from './core/services/accessibility.service';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';
import { ScrollToTop } from './components/scroll-to-top/scroll-to-top';
import { ToastContainer } from './components/ui/toast/toast-container';
import { PushNotificationContainer } from './components/ui/push/push-notification-container';
import { ModalContainer } from './components/ui/modal/modal-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Footer, ScrollToTop, ToastContainer, PushNotificationContainer, ModalContainer],
  templateUrl: './app.html',
  // styleUrls plural para alinearse con la API estándar (evita tooling confuso)
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('mockup-crea');
  // Inyectar AccessibilityService para que sus efectos se ejecuten en bootstrap
  constructor(private accessibility: AccessibilityService) {}
}
