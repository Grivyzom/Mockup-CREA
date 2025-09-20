import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Home } from './home';

class RouterStub {
  public navigatedTo: any[] | null = null;
  navigate(commands: any[]) {
    this.navigatedTo = commands;
    return Promise.resolve(true);
  }
}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: Router, useClass: RouterStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to create project on startNewProject', async () => {
    const router = TestBed.inject(Router) as unknown as RouterStub;
    component.startNewProject();
    expect(router.navigatedTo).toEqual(['/proyectos/nuevo']);
  });

  it('should scroll to projects panel on exploreProjects', () => {
    const scrollIntoViewSpy = jasmine.createSpy('scrollIntoView');
    const fakeEl = document.createElement('div');
    (fakeEl as any).scrollIntoView = scrollIntoViewSpy;
    spyOn(document, 'getElementById').and.returnValue(fakeEl);
    component.exploreProjects();
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });
});
