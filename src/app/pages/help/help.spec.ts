import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Help } from './help';

describe('Help', () => {
  let component: Help;
  let fixture: ComponentFixture<Help>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Help] }).compileComponents();
    fixture = TestBed.createComponent(Help);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main headings', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h2s = Array.from(compiled.querySelectorAll('h2')).map(h => h.textContent?.trim());
    expect(h2s).toContain('Cómo crear un proyecto');
    expect(h2s).toContain('Objetivos de la plataforma');
    expect(h2s).toContain('Tiempo de almacenamiento de proyectos');
    expect(h2s).toContain('Límites actuales del sistema');
  });
});
