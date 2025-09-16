import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scrollbar-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scrollbar-demo.html',
  styleUrl: './scrollbar-demo.css'
})
export class ScrollbarDemo {
  // Datos de ejemplo para las demos
  proyectos = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    titulo: `Proyecto ${i + 1}: Innovación en ${this.getRandomArea()}`,
    descripcion: `Descripción detallada del proyecto ${i + 1} que incluye objetivos, metodología y resultados esperados.`,
    carrera: this.getRandomCarrera(),
    estudiantes: Math.floor(Math.random() * 10) + 1,
    fecha: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));

  carreras = [
    'Informática', 'Diseño', 'Agricultura', 'Mecánica', 
    'Electrónica', 'Salud', 'Administración', 'Gastronomía',
    'Construcción', 'Turismo', 'Comunicaciones', 'Minería'
  ];

  textoLargo = `Este es un ejemplo de texto largo que requiere scroll vertical. 
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, 
sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis 
praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias 
excepturi sint occaecati cupiditate non provident.`;

  private getRandomArea(): string {
    const areas = ['Tecnología', 'Sostenibilidad', 'Educación', 'Salud', 'Industria'];
    return areas[Math.floor(Math.random() * areas.length)];
  }

  private getRandomCarrera(): string {
    return this.carreras[Math.floor(Math.random() * this.carreras.length)];
  }

  showAlert(type: string) {
    alert(`Demo de scrollbar: ${type}`);
  }
}