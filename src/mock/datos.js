// Datos de ejemplo del prototipo. Un solo módulo para que cablear el backend
// sea cambiar estas constantes por fetch, sin tocar las 41 pantallas.

/** Estados del registro: color y símbolo siempre juntos, nunca color solo. */
export const ESTADOS = {
  'Vigente': { color: '#158361', fondo: '#E6F3EE', glifo: '✓' },
  'En actualización': { color: '#9D7700', fondo: '#FFFAE8', glifo: '↻' },
  'Pendiente': { color: '#4C4C4C', fondo: '#F4F4F4', glifo: '•' },
  'Requiere acción': { color: '#A80521', fondo: '#FBE9EC', glifo: '!' },
  'En revisión': { color: '#9D7700', fondo: '#FFFAE8', glifo: '↻' },
  'Requiere tu acción': { color: '#A80521', fondo: '#FBE9EC', glifo: '!' },
  'Aprobada': { color: '#158361', fondo: '#E6F3EE', glifo: '✓' },
}

export const COMUNIDADES = [
  { id: 1, nombre: 'Consejo Comunitario Río Barbacoas Alto', tipo: 'Consejo comunitario', municipio: 'Barbacoas', departamento: 'Nariño', estado: 'Vigente', lat: 1.6821, lng: -78.15 },
  { id: 2, nombre: 'Consejo Comunitario Playa Bonita del Baudó', tipo: 'Consejo comunitario', municipio: 'Bajo Baudó', departamento: 'Chocó', estado: 'Vigente', lat: 4.95, lng: -77.36 },
  { id: 3, nombre: 'Consejo Comunitario Guapi Abajo Unidos', tipo: 'Consejo comunitario', municipio: 'Guapi', departamento: 'Cauca', estado: 'En actualización', lat: 2.5694, lng: -77.8869 },
  { id: 4, nombre: 'Organización de Base Manos de Palenque', tipo: 'Organización de base', municipio: 'Mahates', departamento: 'Bolívar', estado: 'Vigente', lat: 10.2333, lng: -75.1889 },
  { id: 5, nombre: 'Consejo Comunitario Manglares de Tumaco Sur', tipo: 'Consejo comunitario', municipio: 'Tumaco', departamento: 'Nariño', estado: 'Requiere acción', lat: 1.7986, lng: -78.7822 },
  { id: 6, nombre: 'Organización de Base Mujeres del Atrato', tipo: 'Organización de base', municipio: 'Quibdó', departamento: 'Chocó', estado: 'Vigente', lat: 5.6947, lng: -76.6611 },
  { id: 7, nombre: 'Forma y expresión organizativa Tambores de Buenaventura', tipo: 'Forma y expresión organizativa', municipio: 'Buenaventura', departamento: 'Valle del Cauca', estado: 'Vigente', lat: 3.8801, lng: -77.0312 },
  { id: 8, nombre: 'Consejo Comunitario Bajo Calima Norte', tipo: 'Consejo comunitario', municipio: 'Buenaventura', departamento: 'Valle del Cauca', estado: 'En actualización', lat: 3.8801, lng: -77.0312 },
  { id: 9, nombre: 'Organización de Base Raizal Old Providence Roots', tipo: 'Organización de base', municipio: 'San Andrés', departamento: 'Archipiélago de San Andrés', estado: 'Vigente', lat: 12.5847, lng: -81.7006 },
  { id: 10, nombre: 'Consejo Comunitario Timbiquí Costa Adentro', tipo: 'Consejo comunitario', municipio: 'Timbiquí', departamento: 'Cauca', estado: 'Pendiente', lat: 2.7719, lng: -77.6656 },
  { id: 11, nombre: 'Forma y expresión organizativa Cantadoras del San Juan', tipo: 'Forma y expresión organizativa', municipio: 'Istmina', departamento: 'Chocó', estado: 'Vigente', lat: 5.1592, lng: -76.6767 },
  { id: 12, nombre: 'Consejo Comunitario María la Baja Territorio Común', tipo: 'Consejo comunitario', municipio: 'María la Baja', departamento: 'Bolívar', estado: 'Requiere acción', lat: 9.9833, lng: -75.2833 },
  { id: 13, nombre: 'Consejo Comunitario del Río Naya', tipo: 'Consejo comunitario', municipio: 'Buenaventura', departamento: 'Valle del Cauca', estado: 'En actualización', lat: 3.8801, lng: -77.0312 },
  { id: 14, nombre: 'Consejo Comunitario del Bajo Baudó', tipo: 'Consejo comunitario', municipio: 'Bajo Baudó', departamento: 'Chocó', estado: 'Vigente', lat: 4.95, lng: -77.36 },
]

export const TIPOS_ORGANIZACION = ['Consejo comunitario', 'Organización de base', 'Forma y expresión organizativa']

export const DEPARTAMENTOS = [...new Set(COMUNIDADES.map((c) => c.departamento))].sort()

/** Solicitudes del ciudadano (P5, P6). */
export const SOLICITUDES = [
  { numero: 'RUPN-2026-004871', tipo: 'Cambio de representante legal', meta: 'Radicada el 12 de agosto de 2026 · vence el 5 de septiembre de 2026', estado: 'Requiere tu acción', etapa: 'accion' },
  { numero: 'RUPN-2026-004512', tipo: 'Actualización de linderos del territorio', meta: 'Radicada el 30 de julio de 2026', estado: 'En revisión', etapa: 'revision' },
  { numero: 'RUPN-2026-004900', tipo: 'Actualización del censo de integrantes', meta: 'Radicada el 2 de septiembre de 2026 · sin asignar aún', estado: 'Pendiente', etapa: 'revision' },
  { numero: 'RUPN-2026-003980', tipo: 'Registro de nueva junta directiva', meta: 'Resolución 3902 del 14 de julio de 2026', estado: 'Aprobada', etapa: 'aprobada' },
  { numero: 'RUPN-2026-003210', tipo: 'Cambio de representante legal', meta: 'Resolución 3210 del 2 de marzo de 2026', estado: 'Aprobada', etapa: 'aprobada' },
]

/** Casos del back office. `retornos` = devoluciones de pre-revisión ya usadas (máximo 1). */
export const CASOS = [
  {
    numero: 'RUPN-2026-004871',
    tipo: 'Cambio de representante legal',
    comunidad: 'Consejo Comunitario Guapi Abajo Unidos',
    comunidadId: 3,
    lugar: 'Guapi, Cauca',
    antiguedad: '8 días en la etapa',
    retornos: 1,
    asesor: 'Luz Marina Rentería',
    radicadoEl: '12 de agosto de 2026',
    representante: 'Rosalba Mosquera',
  },
  {
    numero: 'RUPN-2026-004512',
    tipo: 'Actualización de linderos del territorio',
    comunidad: 'Consejo Comunitario Guapi Abajo Unidos',
    comunidadId: 3,
    lugar: 'Guapi, Cauca',
    antiguedad: '3 días en la etapa',
    retornos: 0,
    asesor: 'Luz Marina Rentería',
    radicadoEl: '30 de julio de 2026',
    representante: 'Rosalba Mosquera',
  },
  {
    numero: 'RUPN-2026-004777',
    tipo: 'Registro de nueva junta directiva',
    comunidad: 'Consejo Comunitario del Bajo Baudó',
    comunidadId: 2,
    lugar: 'Bajo Baudó, Chocó',
    antiguedad: '1 día en la etapa',
    retornos: 0,
    asesor: 'Luz Marina Rentería',
    radicadoEl: '2 de septiembre de 2026',
    representante: 'Édison Mosquera Palacios',
  },
  {
    numero: 'RUPN-2026-005102',
    tipo: 'Actualización del censo de integrantes',
    comunidad: 'Consejo Comunitario Guapi Abajo Unidos',
    comunidadId: 3,
    lugar: 'Guapi, Cauca',
    antiguedad: 'Radicado hoy',
    retornos: 0,
    asesor: null,
    radicadoEl: '16 de septiembre de 2026',
    representante: 'Rosalba Mosquera',
  },
  // Caso sin retorno usado: es el que hace demostrable la regla del retorno único
  // frente al 004871, que ya lo agotó.
  {
    numero: 'RUPN-2026-004320',
    tipo: 'Cambio de representante legal',
    comunidad: 'Consejo Comunitario del Río Naya',
    comunidadId: 13,
    lugar: 'Buenaventura, Valle del Cauca',
    antiguedad: '1 día en la etapa',
    retornos: 0,
    asesor: 'Daniel Perea',
    radicadoEl: '20 de agosto de 2026',
    representante: 'Aníbal Angulo Caicedo',
  },
  {
    numero: 'RUPN-2026-005098',
    tipo: 'Cambio de representante legal',
    comunidad: 'Consejo Comunitario del Bajo Baudó',
    comunidadId: 14,
    lugar: 'Bajo Baudó, Chocó',
    antiguedad: 'Radicado el 9 de septiembre de 2026',
    retornos: 0,
    asesor: null,
    radicadoEl: '9 de septiembre de 2026',
    representante: 'Édison Mosquera Palacios',
  },
  {
    numero: 'RUPN-2026-005110',
    tipo: 'Registro de nueva junta directiva',
    comunidad: 'Consejo Comunitario del Río Naya',
    comunidadId: 13,
    lugar: 'Buenaventura, Valle del Cauca',
    antiguedad: 'Radicado el 10 de septiembre de 2026',
    retornos: 0,
    asesor: null,
    radicadoEl: '10 de septiembre de 2026',
    representante: 'Aníbal Angulo Caicedo',
  },
  {
    numero: 'RUPN-2026-004690',
    tipo: 'Actualización del censo de integrantes',
    comunidad: 'Consejo Comunitario Manglares de Tumaco Sur',
    comunidadId: 5,
    lugar: 'Tumaco, Nariño',
    antiguedad: '12 días en la etapa',
    retornos: 0,
    asesor: 'María Zapata',
    radicadoEl: '25 de agosto de 2026',
    representante: 'Yolanda Quiñones',
  },
  {
    numero: 'RUPN-2026-004450',
    tipo: 'Actualización de linderos del territorio',
    comunidad: 'Consejo Comunitario Timbiquí Costa Adentro',
    comunidadId: 10,
    lugar: 'Timbiquí, Cauca',
    antiguedad: '14 días en la etapa',
    retornos: 0,
    asesor: 'Carlos Rentería',
    radicadoEl: '21 de agosto de 2026',
    representante: 'Hermes Grueso',
  },
]

/** Asesores y su carga activa (bandeja de asignación, tablero de carga del equipo). */
export const ASESORES = [
  { nombre: 'Daniel Perea', territorio: 'Cauca', casos: 3, pct: 40, antiguedad: '5 días', vencidos: 0 },
  { nombre: 'María Zapata', territorio: 'Nariño', casos: 6, pct: 80, antiguedad: '11 días', vencidos: 1 },
  { nombre: 'Carlos Rentería', territorio: 'Chocó', casos: 5, pct: 65, antiguedad: '9 días', vencidos: 0 },
]

export const TIPOS_TRAMITE = [
  { id: 'representante', nombre: 'Cambio de representante legal', descripcion: 'Avisa que tu comunidad eligió a otra persona como representante legal.', dias: 15 },
  { id: 'junta', nombre: 'Registro de nueva junta directiva', descripcion: 'Registra la junta directiva que eligió tu comunidad.', dias: 15 },
  { id: 'censo', nombre: 'Actualización del censo de integrantes', descripcion: 'Actualiza cuántas personas y familias integran tu comunidad.', dias: 20 },
  { id: 'linderos', nombre: 'Actualización de linderos del territorio', descripcion: 'Informa un cambio en los límites del territorio de tu comunidad.', dias: 30 },
]

export const buscarComunidad = (id) => COMUNIDADES.find((c) => String(c.id) === String(id))
export const buscarCaso = (numero) => CASOS.find((c) => c.numero === numero)
export const buscarSolicitud = (numero) => SOLICITUDES.find((s) => s.numero === numero)
