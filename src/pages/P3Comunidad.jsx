import { Link, useParams } from 'react-router-dom'
import { Button } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { MapaMunicipio } from '../components/MapaConsulta.jsx'
import { Parrafo, Vacio } from '../components/ui.jsx'
import { buscarComunidad, ESTADOS } from '../mock/datos.js'
import { R } from '../routes.js'

// Fechas y acto administrativo del prototipo: el mock no las trae por comunidad.
const REGISTRO = {
  inicial: '14 de marzo de 2005',
  actualizacion: '2 de febrero de 2024',
  resolucion: 'Resolución 2210 de 2005',
  resolucionMeta: 'Firmada el 14 de marzo de 2005 · Documento PDF, 320 KB',
}

const flecha = (
  <span aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 5.5 7 12l6.5 6.5" />
    </svg>
  </span>
)

export default function P3Comunidad() {
  const { id } = useParams()
  const c = buscarComunidad(id)

  if (!c) {
    return (
      <Layout ancho={1080}>
        <Vacio titulo="No encontramos esa comunidad">
          Puede que el enlace esté incompleto o que la comunidad ya no esté en el registro público.{' '}
          <Link to={R.consulta}>Volver a la consulta</Link>.
        </Vacio>
      </Layout>
    )
  }

  const e = ESTADOS[c.estado] ?? ESTADOS['Pendiente']

  return (
    <Layout ancho={1080} padding="24px 24px 64px">
      <Migas items={[{ label: 'Inicio', href: R.inicio }, { label: 'Consultar comunidades', href: R.consulta }, { label: c.nombre }]} />
      <Link
        to={R.consulta}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontFamily: 'var(--font-body)', fontSize: 14, textDecoration: 'none', color: 'var(--text-link)' }}
      >
        {flecha}Volver a la consulta
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 8 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0, maxWidth: '28ch', textWrap: 'pretty' }}>
            {c.nombre}
          </h1>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, lineHeight: '26px', color: 'var(--text-body)', margin: '8px 0 0' }}>
            {c.tipo} · {c.municipio}, {c.departamento}
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: e.fondo, color: e.color,
            border: `1px solid ${e.color}`, borderRadius: 24, padding: '6px 14px',
            fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px',
          }}
        >
          <span aria-hidden="true" style={{ fontWeight: 700 }}>{e.glifo}</span>
          {c.estado}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 24, marginTop: 32, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
            <h2 style={tituloSeccion}>Datos del registro</h2>
            <dl style={{ margin: 0, padding: '4px 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0 24px' }}>
              <Dato etiqueta="Municipio" valor={c.municipio} linea />
              <Dato etiqueta="Departamento" valor={c.departamento} linea />
              <Dato etiqueta="Registro inicial" valor={REGISTRO.inicial} />
              <Dato etiqueta="Última actualización" valor={REGISTRO.actualizacion} />
            </dl>
          </section>

          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
            <h2 style={tituloSeccion}>Acto administrativo que respalda el registro</h2>
            <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <Parrafo style={{ color: 'var(--text-title)' }}><strong>{REGISTRO.resolucion}</strong></Parrafo>
                <Parrafo style={{ fontSize: 14, lineHeight: '22px', margin: '4px 0 0' }}>{REGISTRO.resolucionMeta}</Parrafo>
              </div>
              {/* TODO(backend): descargar el PDF del acto administrativo. */}
              <Button variant="outline" href="#">Descargar la resolución</Button>
            </div>
          </section>

          <p
            style={{
              fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: 0,
              border: '1px solid var(--border-subtle)', borderLeft: '4px solid var(--color-cobalt)', borderRadius: 8,
              background: 'var(--surface-info)', padding: '16px 20px',
            }}
          >
            Esta es la información pública del registro. Para consultar información adicional se requiere una cuenta autorizada.
          </p>
        </div>

        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', overflow: 'hidden' }}>
          <h2 style={{ ...tituloSeccion, fontSize: 16, lineHeight: '22px', padding: '16px 18px' }}>
            Municipio de {c.municipio}, {c.departamento}
          </h2>
          <div style={{ padding: 12, background: 'var(--surface-subtle)' }}>
            <MapaMunicipio comunidad={c} alto={280} />
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', margin: 0, padding: '14px 18px', borderTop: '1px solid var(--border-subtle)' }}>
            El mapa señala el municipio. No publicamos la ubicación precisa del territorio ni de sus asentamientos.
          </p>
        </section>
      </div>
    </Layout>
  )
}

const tituloSeccion = {
  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '26px',
  color: 'var(--text-title)', margin: 0, padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)',
}

function Dato({ etiqueta, valor, linea = false }) {
  return (
    <div style={{ padding: '16px 0', ...(linea ? { borderBottom: '1px solid var(--border-subtle)' } : null) }}>
      <dt style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {etiqueta}
      </dt>
      <dd style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-title)', margin: '4px 0 0' }}>{valor}</dd>
    </div>
  )
}
