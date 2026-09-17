import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchBar } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { Parrafo } from '../components/ui.jsx'
import { R, ruta } from '../routes.js'

const RESULTADOS = [
  { tipo: 'Comunidad', titulo: 'Consejo Comunitario Guapi Abajo Unidos', detalle: 'Guapi, Cauca · en actualización', href: ruta(R.comunidadInterna, { id: 3 }) },
  { tipo: 'Solicitud', titulo: 'RUPN-2026-004871 · Cambio de representante legal', detalle: 'Con Marta Rincón, pendiente de firma', href: ruta(R.firmaCaso, { radicado: 'RUPN-2026-004871' }) },
  { tipo: 'Solicitud', titulo: 'RUPN-2026-005102 · Actualización del censo', detalle: 'En asignación', href: ruta(R.asignacionCaso, { radicado: 'RUPN-2026-005102' }) },
  { tipo: 'Resolución', titulo: 'Resolución 4187 del 27 de agosto de 2026', detalle: 'Cambio de representante legal, Guapi Abajo Unidos', href: ruta(R.firmaCaso, { radicado: 'RUPN-2026-004871' }) },
]

export default function P28Busqueda() {
  const [consulta, setConsulta] = useState('')
  const [buscado, setBuscado] = useState(false)

  // TODO(backend): buscar en radicados, comunidades, representantes y resoluciones,
  // filtrando por los permisos del rol activo.
  const buscar = (v) => {
    setConsulta(v)
    setBuscado(true)
  }

  return (
    <Layout backoffice ancho={860} padding="32px 24px 64px">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Búsqueda global
      </h1>
      <Parrafo style={{ margin: '8px 0 24px' }}>
        Por radicado, comunidad, representante, municipio o número de resolución. Los resultados respetan tus permisos.
      </Parrafo>

      <SearchBar
        label="Buscar"
        placeholder="Ejemplo: Guapi Abajo, RUPN-2026-004871, Resolución 4187"
        buttonLabel="Buscar"
        value={consulta}
        onChange={setConsulta}
        onSearch={buscar}
      />

      {buscado && (
        <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {RESULTADOS.map((r, i) => (
              <li
                key={r.titulo}
                style={{
                  display: 'flex', gap: 16, padding: '16px 20px',
                  ...(i < RESULTADOS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                }}
              >
                <span style={{ flex: 'none', fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', width: 100 }}>
                  {r.tipo}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Link to={r.href} style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px' }}>
                    {r.titulo}
                  </Link>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>{r.detalle}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Layout>
  )
}
