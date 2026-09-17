/**
 * Cliente de la API.
 *
 * Traduce entre el vocabulario del backend (enums en minúscula, §5 del contexto)
 * y el del diseño GOV.CO, que es el que muestran las pantallas. La traducción vive
 * aquí y no en cada vista, para que cambiar un enum no obligue a tocar 41 pantallas.
 *
 * Sin VITE_API_URL el portal sigue funcionando con los datos de ejemplo de
 * src/mock/datos.js, que es lo que permite ver el diseño sin backend arriba.
 */

const BASE = import.meta.env.VITE_API_URL ?? ''

export const hayApi = Boolean(BASE)

/** Estado del registro: enum del backend -> etiqueta del diseño. */
const ESTADO_REGISTRO = {
  vigente: 'Vigente',
  en_actualizacion: 'En actualización',
  desactualizado: 'Pendiente',
  suspendido: 'Requiere acción',
}

/** Tipo de organización: enum del backend -> etiqueta del diseño. */
const TIPO_COMUNIDAD = {
  consejo_comunitario: 'Consejo comunitario',
  organizacion_base: 'Organización de base',
  forma_expresion: 'Forma y expresión organizativa',
}

/** Estado del caso -> lo que ve el ciudadano en el seguimiento (P5/P6). */
const ESTADO_CIUDADANO = {
  RECIBIDO: 'Pendiente',
  RADICADO: 'En revisión',
  CLASIFICADO: 'En revisión',
  ASIGNADO: 'En revisión',
  EN_ANALISIS: 'En revisión',
  PROYECTADO: 'En revisión',
  EN_PRE_REVISION: 'En revisión',
  EN_REVISION: 'En revisión',
  APROBADO: 'En revisión',
  PENDIENTE_RADICACION: 'En revisión',
  FIRMADO: 'Aprobada',
  NOTIFICADO: 'Aprobada',
  CERRADO: 'Aprobada',
  CERRADO_FAVORABLE: 'Aprobada',
  REQUERIMIENTO_CIUDADANO: 'Requiere tu acción',
  CERRADO_DESFAVORABLE: 'Requiere acción',
  DESISTIDO: 'Pendiente',
  ARCHIVADO: 'Pendiente',
  TRASLADADO: 'Pendiente',
}

let token = sessionStorage.getItem('rupn_token') ?? null

export function guardarSesion(nuevo) {
  token = nuevo
  if (nuevo) sessionStorage.setItem('rupn_token', nuevo)
  else sessionStorage.removeItem('rupn_token')
}

export class ErrorApi extends Error {
  constructor(mensaje, estado, cuerpo) {
    super(mensaje)
    this.estado = estado
    this.cuerpo = cuerpo
  }
}

async function pedir(ruta, { metodo = 'GET', cuerpo, formulario } = {}) {
  const cabeceras = {}
  if (token) cabeceras.Authorization = `Bearer ${token}`
  if (cuerpo) cabeceras['Content-Type'] = 'application/json'

  const cuerpoEnviado = formulario ?? (cuerpo ? JSON.stringify(cuerpo) : undefined)
  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    // fetch rechaza un body en GET/HEAD aunque venga vacío.
    ...(metodo === 'GET' || metodo === 'HEAD' ? {} : { body: cuerpoEnviado }),
  })

  const texto = await respuesta.text()
  const datos = texto ? JSON.parse(texto) : null

  if (!respuesta.ok) {
    const detalle = datos?.detail
    const mensaje =
      typeof detalle === 'string' ? detalle : detalle?.mensaje ?? 'No pudimos completar la operación.'
    throw new ErrorApi(mensaje, respuesta.status, datos)
  }
  return datos
}

/** Comunidad del backend -> la forma que esperan las pantallas. */
export const aComunidad = (c) => ({
  id: c.id,
  nombre: c.nombre_oficial,
  tipo: TIPO_COMUNIDAD[c.tipo] ?? c.tipo,
  municipio: c.municipio,
  departamento: c.departamento,
  estado: ESTADO_REGISTRO[c.estado_registro] ?? 'Pendiente',
  lat: c.lat,
  lng: c.lng,
  resolucion: c.resolucion_vigente,
  registroInicial: c.fecha_registro_inicial,
  // Solo vienen en la ficha interna; en la pública no existen (§10).
  representantes: c.representantes,
  ultimaActualizacion: c.fecha_ultima_actualizacion,
})

/** Caso del backend -> la forma que esperan las bandejas y el seguimiento. */
export const aCaso = (c) => ({
  numero: c.numero_seguimiento,
  radicadoExterno: c.radicado_externo,
  estadoInterno: c.estado,
  estado: ESTADO_CIUDADANO[c.estado] ?? 'Pendiente',
  tipo: c.tipo_tramite,
  tipoCiudadano: c.tipo_tramite_ciudadano,
  comunidad: c.comunidad,
  comunidadId: c.comunidad_id,
  lugar: c.comunidad,
  radicadoEl: c.fecha_radicacion,
  vence: c.fecha_vencimiento,
  diasRestantes: c.dias_restantes,
  vencido: c.vencido,
  retornos: c.retorno_usado ? 1 : 0,
  responsableId: c.responsable_id,
  rolResponsable: c.rol_responsable,
  sentido: c.sentido,
  fundamento: c.fundamento,
  datos: c.datos,
})

export const api = {
  // Público
  comunidades: (filtros = {}) => {
    const q = new URLSearchParams(
      Object.entries(filtros).filter(([, v]) => v && v !== 'Todos')
    )
    return pedir(`/api/comunidades?${q}`).then((cs) => cs.map(aComunidad))
  },
  comunidad: (id) => pedir(`/api/comunidades/${id}`).then(aComunidad),
  tiposTramite: () => pedir('/api/tipos-tramite'),

  // Sesión
  entrar: async (correo, clave) => {
    const formulario = new URLSearchParams({ username: correo, password: clave })
    const datos = await pedir('/api/auth/token', { metodo: 'POST', formulario })
    guardarSesion(datos.access_token)
    return datos
  },
  salir: () => guardarSesion(null),
  yo: () => pedir('/api/auth/yo'),

  // Trámite
  validar: (solicitud) => pedir('/api/casos/validar', { metodo: 'POST', cuerpo: solicitud }),
  radicar: (solicitud) => pedir('/api/casos', { metodo: 'POST', cuerpo: solicitud }).then(aCaso),
  caso: (id) => pedir(`/api/casos/${id}`).then(aCaso),
  eventos: (id) => pedir(`/api/casos/${id}/eventos`),
  expediente: (id) => pedir(`/api/casos/${id}/expediente`),

  // Back office
  bandeja: (rol) => pedir(`/api/bandejas/${rol}`).then((cs) => cs.map(aCaso)),
  clasificar: (id, datos) => pedir(`/api/casos/${id}/clasificar`, { metodo: 'POST', cuerpo: datos }).then(aCaso),
  propuestaAsesor: (id) => pedir(`/api/casos/${id}/propuesta-asesor`),
  asignar: (id, datos) => pedir(`/api/casos/${id}/asignar`, { metodo: 'POST', cuerpo: datos }).then(aCaso),
  registrarDecision: (id, datos) => pedir(`/api/casos/${id}/decision`, { metodo: 'POST', cuerpo: datos }).then(aCaso),
  proyectar: (id) => pedir(`/api/casos/${id}/proyeccion`, { metodo: 'POST' }),
  editarProyeccion: (id, datos) => pedir(`/api/casos/${id}/proyeccion`, { metodo: 'PUT', cuerpo: datos }),
  preRevision: (id) => pedir(`/api/casos/${id}/pre-revision`, { metodo: 'POST' }),
  hallazgos: (id) => pedir(`/api/casos/${id}/hallazgos`),
  justificar: (id, hid, datos) => pedir(`/api/casos/${id}/hallazgos/${hid}/justificar`, { metodo: 'POST', cuerpo: datos }),
  revisar: (id, datos) => pedir(`/api/casos/${id}/revisar`, { metodo: 'POST', cuerpo: datos }).then(aCaso),
  firmar: (id) => pedir(`/api/casos/${id}/firmar`, { metodo: 'POST' }).then(aCaso),
  notificar: (id) => pedir(`/api/casos/${id}/notificar`, { metodo: 'POST' }).then(aCaso),
  cerrar: (id, datos) => pedir(`/api/casos/${id}/cerrar`, { metodo: 'POST', cuerpo: datos }).then(aCaso),

  // Métricas
  tablero: () => pedir('/api/metricas/tablero'),
  simulacion: (casoId) => pedir(`/api/metricas/simulacion${casoId ? `?caso_id=${casoId}` : ''}`),
}
