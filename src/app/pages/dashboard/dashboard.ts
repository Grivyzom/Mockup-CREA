import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../../components/calendar/calendar';

interface DashboardCard {
  id: number;
  title: string;
  content: string;
  type: 'chart' | 'stats' | 'list' | 'activity';
  size: 'small' | 'medium' | 'large';
  color?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CalendarComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  
  selectedDate: Date | null = null;
  activeTab: string = 'proyectos'; // Para navegación móvil

  // Configuración de columnas para el dashboard
  leftColumnCards: DashboardCard[] = [
    {
      id: 1,
      title: 'Proyectos Activos',
      content: 'Gestión de proyectos en curso',
      type: 'chart',
      size: 'large',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Estadísticas Semanales',
      content: 'Métricas de rendimiento',
      type: 'stats',
      size: 'medium',
      color: 'green'
    }
  ];

  centerColumnCards: DashboardCard[] = [
    {
      id: 3,
      title: 'Timeline de Actividades',
      content: 'Actividades recientes del equipo',
      type: 'activity',
      size: 'large',
      color: 'purple'
    },
    {
      id: 4,
      title: 'Tareas Pendientes',
      content: 'Lista de tareas por completar',
      type: 'list',
      size: 'medium',
      color: 'orange'
    }
  ];

  rightColumnCards: DashboardCard[] = [
    {
      id: 5,
      title: 'Notificaciones',
      content: 'Alertas y mensajes importantes',
      type: 'list',
      size: 'medium',
      color: 'red'
    },
    {
      id: 7,
      title: 'Recursos',
      content: 'Documentos y enlaces útiles',
      type: 'list',
      size: 'small',
      color: 'teal'
    }
  ];

  // Métodos para interacción
  onCardClick(card: DashboardCard) {
    console.log('Card clicked:', card);
    // Aquí puedes agregar navegación o abrir modales
  }

  onCardAction(card: DashboardCard, action: string) {
    console.log(`Action ${action} on card:`, card);
    // Aquí puedes manejar acciones específicas de cada card
  }

  onDateSelected(date: Date | null) {
    this.selectedDate = date;
    if (date) {
      console.log('Fecha seleccionada:', date);
    } else {
      console.log('Fecha deseleccionada');
    }
    // Aquí puedes filtrar contenido basado en la fecha seleccionada o limpiar filtros si es null
  }

  // Métodos para navegación móvil
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}