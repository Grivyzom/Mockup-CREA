import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';
import { ScrollToTop } from './components/scroll-to-top/scroll-to-top';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Footer, ScrollToTop],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('mockup-crea');
}
