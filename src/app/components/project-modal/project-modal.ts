import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface ProjectMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

export interface ProjectData {
  id: number;
  title: string;
  description: string;
  area: string;
  areaDisplay: string;
  areas: string[];
  duration: string;
  difficulty: string;
  students: number;
  members?: ProjectMember[];
  status: string;
  progress: number;
  fullDescription?: string;
  technologies?: string[];
  objectives?: string[];
  startDate?: string;
  endDate?: string;
}

@Component({
  selector: 'app-project-modal',
  imports: [CommonModule],
  templateUrl: './project-modal.html',
  styleUrls: ['./project-modal.css']
})
export class ProjectModal {
  @Input() isOpen = false;
  @Input() project: ProjectData | null = null;
  @Input() isDarkMode: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private router: Router) {}

  onCloseModal() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCloseModal();
    }
  }

  viewFullProject() {
    if (this.project) {
      this.router.navigate(['/proyecto', this.project.id]);
      this.onCloseModal();
    }
  }

  // Método para obtener el color del área
  getAreaColor(area: string): string {
    const colors: { [key: string]: string } = {
      'informatica': 'from-blue-500 to-cyan-500',
      'diseño': 'from-purple-500 to-pink-500',
      'agricultura': 'from-green-500 to-emerald-500',
      'mecanica': 'from-gray-600 to-slate-600',
      'electronica': 'from-yellow-500 to-orange-500'
    };
    return colors[area] || 'from-gray-400 to-gray-600';
  }

  // Método para obtener el ícono del área
  getAreaIcon(area: string): string {
    const icons: { [key: string]: string } = {
      'informatica': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'diseño': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4m-6-6h.01M17 7v10',
      'agricultura': 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v-2a6 6 0 116 6v-2m6 0a2 2 0 100-4m0 4a2 2 0 100 4m0-4v-2a6 6 0 10-6 6v-2',
      'mecanica': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'electronica': 'M13 10V3L4 14h7v7l9-11h-7z'
    };
    return icons[area] || 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
  }

  // Etiquetas legibles para las áreas
  getAreaLabel(area: string): string {
    const labels: { [k: string]: string } = {
      'informatica': 'Informática',
      'diseño': 'Diseño Gráfico',
      'agricultura': 'Agricultura',
      'mecanica': 'Mecánica',
      'electronica': 'Electrónica',
      'salud': 'Salud'
    };
    return labels[area] ?? area;
  }

  // Obtener color del estado
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'En progreso': 'bg-blue-100 text-blue-800',
      'Completado': 'bg-green-100 text-green-800',
      'Pausado': 'bg-yellow-100 text-yellow-800',
      'Cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}