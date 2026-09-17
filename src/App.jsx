import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { R } from './routes.js'
import Layout from './components/Layout.jsx'
import { Vacio } from './components/ui.jsx'
import { ProveedorSesion } from './api/sesion.jsx'
import { Spinner } from './ds/index.js'

import P1Inicio from './pages/P1Inicio.jsx'
const P2Consulta = lazy(() => import('./pages/P2Consulta.jsx'))
const P3Comunidad = lazy(() => import('./pages/P3Comunidad.jsx'))
const P4Ingreso = lazy(() => import('./pages/P4Ingreso.jsx'))
const P5Solicitudes = lazy(() => import('./pages/P5Solicitudes.jsx'))
const P6Solicitud = lazy(() => import('./pages/P6Solicitud.jsx'))
const P7Tipo = lazy(() => import('./pages/P7Tipo.jsx'))
const P7Datos = lazy(() => import('./pages/P7Datos.jsx'))
const P7Comunidad = lazy(() => import('./pages/P7Comunidad.jsx'))
const P8Documentos = lazy(() => import('./pages/P8Documentos.jsx'))
const P8bEnviar = lazy(() => import('./pages/P8bEnviar.jsx'))

const P9AsesorBandeja = lazy(() => import('./pages/P9AsesorBandeja.jsx'))
const P10AsesorCaso = lazy(() => import('./pages/P10AsesorCaso.jsx'))
const P11Proyeccion = lazy(() => import('./pages/P11Proyeccion.jsx'))
const P12RevisionBandeja = lazy(() => import('./pages/P12RevisionBandeja.jsx'))
const P13RevisionCaso = lazy(() => import('./pages/P13RevisionCaso.jsx'))
const P14FirmaBandeja = lazy(() => import('./pages/P14FirmaBandeja.jsx'))
const P15Firma = lazy(() => import('./pages/P15Firma.jsx'))
const P29Cierre = lazy(() => import('./pages/P29Cierre.jsx'))

const P16ClasifBandeja = lazy(() => import('./pages/P16ClasifBandeja.jsx'))
const P17ClasifCaso = lazy(() => import('./pages/P17ClasifCaso.jsx'))
const P18AsignBandeja = lazy(() => import('./pages/P18AsignBandeja.jsx'))
const P19AsignCaso = lazy(() => import('./pages/P19AsignCaso.jsx'))
const P20Radicacion = lazy(() => import('./pages/P20Radicacion.jsx'))
const P21Tablero = lazy(() => import('./pages/P21Tablero.jsx'))
const P24IngresoFuncionario = lazy(() => import('./pages/P24IngresoFuncionario.jsx'))
const P25ComunidadInterna = lazy(() => import('./pages/P25ComunidadInterna.jsx'))
const P26Pendientes = lazy(() => import('./pages/P26Pendientes.jsx'))
const P27MiTrabajo = lazy(() => import('./pages/P27MiTrabajo.jsx'))
const P28Busqueda = lazy(() => import('./pages/P28Busqueda.jsx'))
const P30Digitalizacion = lazy(() => import('./pages/P30Digitalizacion.jsx'))
const P36CargaEquipo = lazy(() => import('./pages/P36CargaEquipo.jsx'))

const P22Usuarios = lazy(() => import('./pages/P22Usuarios.jsx'))
const P23TiposTramite = lazy(() => import('./pages/P23TiposTramite.jsx'))
const P31Reglas = lazy(() => import('./pages/P31Reglas.jsx'))
const P32Arbol = lazy(() => import('./pages/P32Arbol.jsx'))
const P33Auditoria = lazy(() => import('./pages/P33Auditoria.jsx'))
const P34Integraciones = lazy(() => import('./pages/P34Integraciones.jsx'))
const P35ConsultaArbol = lazy(() => import('./pages/P35ConsultaArbol.jsx'))
const P37Rubrica = lazy(() => import('./pages/P37Rubrica.jsx'))
const P38Plantillas = lazy(() => import('./pages/P38Plantillas.jsx'))
const P39Microcopy = lazy(() => import('./pages/P39Microcopy.jsx'))
const P40ClasifDatos = lazy(() => import('./pages/P40ClasifDatos.jsx'))

/** Mientras llega el trozo de la pantalla. */
function Cargando() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
      <span className="sr-only">Cargando la pantalla</span>
    </div>
  )
}

function NoEncontrada() {
  return (
    <Layout ancho={860}>
      <Vacio titulo="No encontramos esa página">
        Revisa el enlace o vuelve al <Link to={R.inicio}>inicio del registro</Link>.
      </Vacio>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ProveedorSesion>
      <Suspense fallback={<Cargando />}>
        <Routes>
          {/* Ciudadano */}
          <Route path={R.inicio} element={<P1Inicio />} />
          <Route path={R.consulta} element={<P2Consulta />} />
          <Route path={R.comunidad} element={<P3Comunidad />} />
          <Route path={R.ingreso} element={<P4Ingreso />} />
          <Route path={R.solicitudes} element={<P5Solicitudes />} />
          <Route path={R.solicitud} element={<P6Solicitud />} />
          <Route path={R.tramiteTipo} element={<P7Tipo />} />
          <Route path={R.tramiteDatos} element={<P7Datos />} />
          <Route path={R.tramiteComunidad} element={<P7Comunidad />} />
          <Route path={R.tramiteDocumentos} element={<P8Documentos />} />
          <Route path={R.tramiteEnviar} element={<P8bEnviar />} />

          {/* Back office — asesor, revisor, firmante */}
          <Route path={R.asesorBandeja} element={<P9AsesorBandeja />} />
          <Route path={R.asesorCaso} element={<P10AsesorCaso />} />
          <Route path={R.asesorProyeccion} element={<P11Proyeccion />} />
          <Route path={R.revisionBandeja} element={<P12RevisionBandeja />} />
          <Route path={R.cierreTerminal} element={<P29Cierre />} />
          <Route path={R.revisionCaso} element={<P13RevisionCaso />} />
          <Route path={R.firmaBandeja} element={<P14FirmaBandeja />} />
          <Route path={R.firmaCaso} element={<P15Firma />} />

          {/* Back office — clasificación, asignación, ventanilla, coordinación */}
          <Route path={R.clasificacionBandeja} element={<P16ClasifBandeja />} />
          <Route path={R.clasificacionCaso} element={<P17ClasifCaso />} />
          <Route path={R.asignacionBandeja} element={<P18AsignBandeja />} />
          <Route path={R.asignacionCaso} element={<P19AsignCaso />} />
          <Route path={R.radicacionAsistida} element={<P20Radicacion />} />
          <Route path={R.tableroGestion} element={<P21Tablero />} />
          <Route path={R.ingresoFuncionario} element={<P24IngresoFuncionario />} />
          <Route path={R.comunidadInterna} element={<P25ComunidadInterna />} />
          <Route path={R.pendientesRadicacion} element={<P26Pendientes />} />
          <Route path={R.miTrabajo} element={<P27MiTrabajo />} />
          <Route path={R.busquedaGlobal} element={<P28Busqueda />} />
          <Route path={R.digitalizacion} element={<P30Digitalizacion />} />
          <Route path={R.consultaArbol} element={<P35ConsultaArbol />} />
          <Route path={R.cargaEquipo} element={<P36CargaEquipo />} />

          {/* Administración funcional y técnica */}
          <Route path={R.usuarios} element={<P22Usuarios />} />
          <Route path={R.tiposTramite} element={<P23TiposTramite />} />
          <Route path={R.reglasValidacion} element={<P31Reglas />} />
          <Route path={R.arbolClasificacion} element={<P32Arbol />} />
          <Route path={R.auditoria} element={<P33Auditoria />} />
          <Route path={R.integraciones} element={<P34Integraciones />} />
          <Route path={R.rubrica} element={<P37Rubrica />} />
          <Route path={R.plantillas} element={<P38Plantillas />} />
          <Route path={R.microcopy} element={<P39Microcopy />} />
          <Route path={R.clasificacionDatos} element={<P40ClasifDatos />} />

          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </Suspense>
      </ProveedorSesion>
    </BrowserRouter>
  )
}
