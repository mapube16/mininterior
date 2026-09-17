// Una ruta por pantalla del handoff. El código PN se conserva en el comentario
// para poder cotejar cada vista con su .dc.html de origen.
export const R = {
  inicio: '/',                              // P1
  consulta: '/consulta',                    // P2
  comunidad: '/comunidad/:id',              // P3
  ingreso: '/ingreso',                      // P4
  solicitudes: '/solicitudes',              // P5
  solicitud: '/solicitudes/:radicado',      // P6
  tramiteTipo: '/tramite',                  // P7
  tramiteDatos: '/tramite/datos',           // P7 paso 2
  tramiteComunidad: '/tramite/comunidad',   // P7 paso 3
  tramiteDocumentos: '/tramite/documentos', // P8
  tramiteEnviar: '/tramite/enviar',         // P8b: revisar y radicar

  asesorBandeja: '/bo/asesor',              // P9
  asesorCaso: '/bo/asesor/:radicado',       // P10
  asesorProyeccion: '/bo/asesor/:radicado/proyeccion', // P11
  revisionBandeja: '/bo/revision',          // P12
  revisionCaso: '/bo/revision/:radicado',   // P13
  firmaBandeja: '/bo/firma',                // P14
  firmaCaso: '/bo/firma/:radicado',         // P15
  clasificacionBandeja: '/bo/clasificacion',       // P16
  clasificacionCaso: '/bo/clasificacion/:radicado',// P17
  asignacionBandeja: '/bo/asignacion',             // P18
  asignacionCaso: '/bo/asignacion/:radicado',      // P19
  radicacionAsistida: '/bo/radicacion',     // P20
  tableroGestion: '/bo/tablero',            // P21
  usuarios: '/bo/admin/usuarios',           // P22
  tiposTramite: '/bo/admin/tipos-tramite',  // P23
  ingresoFuncionario: '/bo/ingreso',        // P24
  comunidadInterna: '/bo/comunidad/:id',    // P25
  pendientesRadicacion: '/bo/pendientes-radicacion', // P26
  miTrabajo: '/bo/mi-trabajo',              // P27
  busquedaGlobal: '/bo/busqueda',           // P28
  cierreTerminal: '/bo/revision/:radicado/cierre',  // P29
  digitalizacion: '/bo/digitalizacion',     // P30
  reglasValidacion: '/bo/admin/reglas',     // P31
  arbolClasificacion: '/bo/admin/arbol',    // P32
  auditoria: '/bo/admin/auditoria',         // P33
  integraciones: '/bo/admin/integraciones', // P34
  consultaArbol: '/bo/arbol',               // P35
  cargaEquipo: '/bo/carga-equipo',          // P36
  rubrica: '/bo/admin/rubrica',             // P37
  plantillas: '/bo/admin/plantillas',       // P38
  microcopy: '/bo/admin/microcopy',         // P39
  clasificacionDatos: '/bo/admin/clasificacion-datos', // P40
}

// Reemplaza :params de una plantilla de ruta: ruta(R.solicitud, {radicado:'RUPN-...'})
export const ruta = (plantilla, params = {}) =>
  Object.entries(params).reduce((p, [k, v]) => p.replace(`:${k}`, encodeURIComponent(v)), plantilla)
