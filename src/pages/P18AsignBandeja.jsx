import Layout from '../components/Layout.jsx'
import { Parrafo, BotonLink } from '../components/ui.jsx'
import { R, ruta } from '../routes.js'

// Casos ya clasificados, con el asesor que propone el sistema.
const CASOS = [
  { numero: 'RUPN-2026-005102', tipo: 'Actualización del censo de integrantes', comunidad: 'Consejo Comunitario Guapi Abajo Unidos', propuesta: 'Daniel Perea' },
  { numero: 'RUPN-2026-005098', tipo: 'Cambio de representante legal', comunidad: 'Consejo Comunitario del Bajo Baudó', propuesta: 'María Zapata' },
]

const CARGA = [
  { nombre: 'Daniel Perea', casos: 3 },
  { nombre: 'María Zapata', casos: 5 },
  { nombre: 'Carlos Renteria', casos: 2 },
]

export default function P18AsignBandeja() {
  return (
    <Layout backoffice padding="0">
      <Sesion>Sesión de <strong>Julián Ospina</strong> · Mesa de asignación · Dirección de Asuntos NARP</Sesion>
      <div style={{ padding: '24px 24px 64px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
          Bandeja de asignación
        </h1>
        <Parrafo style={{ margin: '8px 0 0', maxWidth: '70ch' }}>
          Casos ya clasificados, con el asesor que propone el sistema según carga, territorio y especialidad.
        </Parrafo>

        <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {CASOS.map((c, i) => (
              <li
                key={c.numero}
                style={{
                  display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
                  ...(i < CASOS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-muted)' }}>
                    {c.numero} · {c.tipo}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', marginTop: 2 }}>
                    {c.comunidad}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                    Propuesta: {c.propuesta}
                  </span>
                </div>
                <BotonLink variant="outline" to={ruta(R.asignacionCaso, { radicado: c.numero })}>Asignar</BotonLink>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: '0 0 12px' }}>
            Carga actual del equipo
          </h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {CARGA.map((a) => (
              <div key={a.nombre} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '12px 16px', minWidth: 160 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-title)' }}>{a.nombre}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, lineHeight: '28px', color: 'var(--text-title)', marginTop: 2 }}>{a.casos}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '18px', color: 'var(--text-muted)' }}>casos activos</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}

function Sesion({ children }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-subtle)' }}>
      <div style={{ padding: '12px 24px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)' }}>
        {children}
      </div>
    </div>
  )
}
