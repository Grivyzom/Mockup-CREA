export interface CareerOption {
  id: string;
  name: string;
  group: string; // Macro-área
}

// Lista ampliada representativa de carreras INACAP (puedes ajustar / completar según catálogo oficial)
// Fuente: Conocimiento general de áreas formativas típicas (no incluye todos los programas específicos).
export const CAREERS: CareerOption[] = [
  // Tecnología & Informática
  { id: 'ing-inf', name: 'Ingeniería en Informática', group: 'Tecnología & Informática' },
  { id: 'analista-prog', name: 'Analista Programador', group: 'Tecnología & Informática' },
  { id: 'ciberseguridad', name: 'Ciberseguridad', group: 'Tecnología & Informática' },
  { id: 'telecomunicaciones', name: 'Telecomunicaciones y Redes', group: 'Tecnología & Informática' },
  { id: 'datos', name: 'Gestión de Datos / Data Analytics', group: 'Tecnología & Informática' },
  // Diseño & Comunicación
  { id: 'dis-grafico', name: 'Diseño Gráfico', group: 'Diseño & Comunicación' },
  { id: 'dis-multimedia', name: 'Diseño Multimedia / UX', group: 'Diseño & Comunicación' },
  { id: 'publicidad', name: 'Publicidad', group: 'Diseño & Comunicación' },
  { id: 'audiovisual', name: 'Comunicación Audiovisual', group: 'Diseño & Comunicación' },
  // Salud
  { id: 'enfermeria', name: 'Enfermería', group: 'Salud' },
  { id: 'kinesiologia', name: 'Kinesiología', group: 'Salud' },
  { id: 'nutricion', name: 'Nutrición y Dietética', group: 'Salud' },
  { id: 'tec-medico', name: 'Tecnología Médica', group: 'Salud' },
  // Administración & Negocios
  { id: 'adm-emp', name: 'Administración de Empresas', group: 'Administración & Negocios' },
  { id: 'contabilidad', name: 'Contabilidad', group: 'Administración & Negocios' },
  { id: 'logistica', name: 'Logística', group: 'Administración & Negocios' },
  { id: 'marketing', name: 'Marketing Digital', group: 'Administración & Negocios' },
  { id: 'rrhh', name: 'Recursos Humanos', group: 'Administración & Negocios' },
  // Industria & Ingeniería
  { id: 'mecanica', name: 'Ingeniería Mecánica', group: 'Industria & Ingeniería' },
  { id: 'automatizacion', name: 'Automatización y Control Industrial', group: 'Industria & Ingeniería' },
  { id: 'mineria', name: 'Ingeniería en Minas', group: 'Industria & Ingeniería' },
  { id: 'prev-riesgos', name: 'Prevención de Riesgos', group: 'Industria & Ingeniería' },
  { id: 'industrial', name: 'Ingeniería Industrial', group: 'Industria & Ingeniería' },
  // Energía & Electrónica
  { id: 'electricidad', name: 'Ingeniería en Electricidad', group: 'Energía & Electrónica' },
  { id: 'electronica', name: 'Electrónica', group: 'Energía & Electrónica' },
  { id: 'energias-renovables', name: 'Energías Renovables', group: 'Energía & Electrónica' },
  { id: 'eficiencia-energetica', name: 'Gestión de Eficiencia Energética', group: 'Energía & Electrónica' },
  // Agro & Medio Ambiente
  { id: 'agricultura', name: 'Agricultura / Agroindustria', group: 'Agro & Medio Ambiente' },
  { id: 'medioambiente', name: 'Gestión Ambiental', group: 'Agro & Medio Ambiente' },
  { id: 'vinos', name: 'Enología / Vitivinicultura', group: 'Agro & Medio Ambiente' },
  // Construcción & Hábitat
  { id: 'construccion', name: 'Construcción Civil', group: 'Construcción & Hábitat' },
  { id: 'topografia', name: 'Topografía', group: 'Construcción & Hábitat' },
  { id: 'arquitectura-int', name: 'Arquitectura de Interiores', group: 'Construcción & Hábitat' },
  // Turismo & Gastronomía
  { id: 'gastronomia', name: 'Gastronomía', group: 'Turismo & Gastronomía' },
  { id: 'turismo', name: 'Turismo', group: 'Turismo & Gastronomía' },
  { id: 'gestion-hotelera', name: 'Gestión Hotelera', group: 'Turismo & Gastronomía' },
  // Transporte & Logística ampliado
  { id: 'transporte', name: 'Gestión del Transporte', group: 'Administración & Negocios' },
];

export function groupCareers(list: CareerOption[]): Record<string, CareerOption[]> {
  return list.reduce((acc, c) => {
    (acc[c.group] = acc[c.group] || []).push(c);
    return acc;
  }, {} as Record<string, CareerOption[]>);
}
