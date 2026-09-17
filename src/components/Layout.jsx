import { Link, useLocation } from 'react-router-dom'
import { TopBar, Header, Footer } from '../ds/index.js'
import { R } from '../routes.js'

const ACCENT = '#D23C46' // Ministerio del Interior

const NAV_CIUDADANO = [
  { label: 'Inicio', href: R.inicio },
  { label: 'Consultar comunidades', href: R.consulta },
  { label: 'Hacer o seguir un trámite', href: R.ingreso },
  { label: 'Transparencia y acceso a información pública', href: '#' },
]

const NAV_BACKOFFICE = [
  { label: 'Mi trabajo', href: R.miTrabajo },
  { label: 'Clasificación', href: R.clasificacionBandeja },
  { label: 'Asignación', href: R.asignacionBandeja },
  { label: 'Asesor', href: R.asesorBandeja },
  { label: 'Revisión', href: R.revisionBandeja },
  { label: 'Firma', href: R.firmaBandeja },
  { label: 'Búsqueda global', href: R.busquedaGlobal },
  { label: 'Portal ciudadano', href: R.inicio },
]

const SEDES = [
  {
    name: 'Atención a la ciudadanía',
    lines: [
      'Dirección: Carrera 8 # 7 - 83, Bogotá D.C.',
      'Horario de atención: lunes a viernes, 8:00 a.m. a 5:00 p.m.',
      'Línea gratuita nacional: 01 8000 000 000',
      'Teléfono en Bogotá: +57 (601) 242 40 00',
      'Correo institucional: registronarp@mininterior.gov.co',
      'Notificaciones judiciales: judiciales@mininterior.gov.co',
    ],
  },
]

const FOOTER_LINKS = [
  'Transparencia y acceso a información pública',
  'Atención a la ciudadanía',
  'Política de tratamiento de datos personales',
  'Accesibilidad',
  'Mapa del sitio',
]

/** Franja tricolor de 4px bajo el header, en todas las pantallas. */
function Tricolor() {
  return (
    <div style={{ display: 'flex', height: 4, width: '100%' }} aria-hidden="true">
      <div style={{ flex: 1, background: '#FCD116' }} />
      <div style={{ flex: 1, background: '#003893' }} />
      <div style={{ flex: 1, background: '#CE1126' }} />
    </div>
  )
}

/**
 * Esqueleto repetido en las 41 pantallas: TopBar, Header, tricolor, main, Footer.
 * `ancho` es el max-width del <main> (1160 por defecto, 860 en formularios).
 */
export default function Layout({ children, backoffice = false, ancho = 1160, padding = '32px 24px 64px' }) {
  const { pathname } = useLocation()
  const base = backoffice ? NAV_BACKOFFICE : NAV_CIUDADANO
  const items = base.map((it) => ({
    ...it,
    current: it.href === pathname || (it.href !== R.inicio && pathname.startsWith(it.href)),
  }))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}>
      <TopBar />
      <Header
        accent={ACCENT}
        entity="Ministerio del Interior"
        subtitle={backoffice ? 'Gestión interna · Registro Público NARP' : 'Registro Público Único Nacional de comunidades NARP'}
        sealLabel="ESC"
        items={items}
      />
      <Tricolor />
      <main
        id="contenido-principal"
        style={{ flex: 1, width: '100%', maxWidth: ancho, margin: '0 auto', padding, boxSizing: 'border-box' }}
      >
        {children}
      </main>
      <Footer
        accent={ACCENT}
        entity="Ministerio del Interior · Dirección de Asuntos para Comunidades Negras, Afrocolombianas, Raizales y Palenqueras"
        links={FOOTER_LINKS}
        sedes={SEDES}
        social={['@MinInterior', '@MinInterior', '@MinInterior']}
      />
    </div>
  )
}

/** Miga de pan nativa: el Breadcrumb del kit rompe el layout con el título (ver P6 del handoff). */
export function Migas({ items }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', margin: 0, padding: 0,
        fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)' }}>
        {items.map((it, i) => (
          <li key={it.label} style={{ display: 'flex', gap: 8 }}>
            {it.href ? <Link to={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
            {i < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
