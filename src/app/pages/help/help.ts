import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help.html',
  styleUrl: './help.css'
})
export class Help {
  // FAQ data (podría migrarse a servicio si crece)
  faqs = [
    {
      id: 'faq-proposito',
      q: '¿Cuál es el propósito principal de la plataforma?',
      a: 'Facilitar la creación, visibilidad y colaboración en proyectos interdisciplinarios académicos, generando evidencia verificable para estudiantes y docentes.'
    },
    {
      id: 'faq-borradores',
      q: '¿Mis borradores se sincronizan entre dispositivos?',
      a: 'No. Los borradores permanecen sólo en el almacenamiento local del navegador actual (localStorage). Si borras datos de navegación se perderán.'
    },
    {
      id: 'faq-carreras',
      q: '¿Por qué existe un límite de 8 carreras?',
      a: 'Para mantener foco y relevancia: más de 8 reduce claridad y complica la evaluación transversal. Podría ajustarse tras métricas de adopción.'
    },
    {
      id: 'faq-imagenes',
      q: '¿Existe límite de peso para las imágenes?',
      a: 'Aún no hay límite duro implementado. Se añadirá una política de peso y optimización automática en una fase posterior.'
    },
    {
      id: 'faq-visibilidad',
      q: '¿Cuándo aparece un proyecto en destacados o carrusel mensual?',
      a: 'Cuando cumpla reglas de selección (relevancia temática, diversidad de carreras, avance y validación docente). Estas reglas se comunicarán antes de activarse.'
    },
    {
      id: 'faq-privacidad',
      q: '¿Qué datos personales se almacenan?',
      a: 'Sólo los necesarios para identificar responsables del proyecto (nombre institucional y correo). No se exponen correos completos públicamente.'
    },
    {
      id: 'faq-eliminacion',
      q: '¿Puedo eliminar un proyecto publicado?',
      a: 'Próximamente: se ofrecerá una solicitud de archivado; la eliminación permanente requiere política institucional de retención.'
    },
    {
      id: 'faq-accesibilidad',
      q: '¿La plataforma considera accesibilidad web (WCAG)?',
      a: 'Sí, se aplican mejoras progresivas: navegación por teclado, roles ARIA, contraste y avisos en vivo. Continuaremos ampliando pruebas automáticas.'
    }
  ];

  openFaqIds = signal<Set<string>>(new Set());
  query = signal('');

  filteredFaqs = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.faqs;
    return this.faqs.filter(f =>
      f.q.toLowerCase().includes(q) ||
      f.a.toLowerCase().includes(q)
    );
  });

  onQueryInput(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.query.set(value);
  }

  toggleFaq(id: string) {
    const next = new Set(this.openFaqIds());
    if (next.has(id)) next.delete(id); else next.add(id);
    this.openFaqIds.set(next);
  }

  isOpen(id: string) { return this.openFaqIds().has(id); }

  expandAllVisible() {
    const next = new Set(this.openFaqIds());
    this.filteredFaqs().forEach(f => next.add(f.id));
    this.openFaqIds.set(next);
  }

  collapseAll() {
    this.openFaqIds.set(new Set());
  }
}
