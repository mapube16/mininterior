import Layout from '../components/Layout.jsx'
import { Parrafo } from '../components/ui.jsx'

const EQUIPO = [
  { nombre: 'Daniel Perea', territorio: 'Cauca', casos: 3, pct: 40, antiguedad: '5 días', vencidos: 0 },
  { nombre: 'María Zapata', territorio: 'Chocó', casos: 5, pct: 65, antiguedad: '7 días', vencidos: 1 },
  { nombre: 'Carlos Renteria', territorio: 'Valle del Cauca / Bolívar', casos: 2, pct: 25, antiguedad: '3 días', vencidos: 0 },
]

export default function P36CargaEquipo() {
  return (
    <Layout backoffice padding="0">
      <Sesion>Sesión de <strong>Julián Ospina</strong> · Mesa de asignación · Dirección de Asuntos NARP</Sesion>
      <div style={{ padding: '24px 24px 64px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
          Tablero de carga del equipo
        </h1>
        <Parrafo style={{ margin: '8px 0 0', maxWidth: '70ch' }}>Para balancear antes de que se acumule, no después.</Parrafo>

        <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {EQUIPO.map((a, i) => {
              const color = a.vencidos > 0 ? '#A80521' : '#158361'
              const fondo = a.vencidos > 0 ? '#FBE9EC' : '#E6F3EE'
              return (
                <li
                  key={a.nombre}
                  style={{
                    display: 'flex', gap: 16, alignItems: 'center', padding: '16px 20px',
                    ...(i < EQUIPO.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>
                      {a.nombre} · {a.territorio}
                    </span>
                    <div aria-hidden="true" style={{ height: 8, borderRadius: 4, background: 'var(--surface-subtle)', marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${a.pct}%`, background: 'var(--color-cobalt)' }} />
                    </div>
                  </div>
                  <span style={{ flex: 'none', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', width: 90, textAlign: 'right' }}>
                    {a.casos} casos
                  </span>
                  <span style={{ flex: 'none', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', width: 130, textAlign: 'right' }}>
                    {a.antiguedad} promedio
                  </span>
                  <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', background: fondo, color, border: `1px solid ${color}`, borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                    {a.vencidos} vencidos
                  </span>
                </li>
              )
            })}
          </ul>
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
