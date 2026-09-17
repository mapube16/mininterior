import Layout from '../components/Layout.jsx'
import { Parrafo } from '../components/ui.jsx'

const KPIS = [
  { valor: '28', etiqueta: 'Casos activos' },
  { valor: '9 días', etiqueta: 'Edad promedio por etapa' },
  { valor: '2', etiqueta: 'Casos vencidos' },
  { valor: '3.4%', etiqueta: 'Uso de la rama de aclaración' },
  { valor: '12 días', etiqueta: 'Tiempo de ciclo del mes' },
]

const ETAPAS = [
  { titulo: 'Clasificación', cantidad: 6, color: '#0943B5' },
  { titulo: 'Asignación', cantidad: 4, color: '#158361' },
  { titulo: 'Análisis', cantidad: 11, color: '#9D7700' },
  { titulo: 'Revisión', cantidad: 5, color: '#D23C46' },
  { titulo: 'Firma', cantidad: 2, color: '#4C4C4C' },
]

const RIESGO = [
  { numero: 'RUPN-2026-004690', etapa: 'Análisis', responsable: 'María Zapata', tipo: 'Cambio de representante legal', criticidad: 'Vence en 2 días', color: '#A80521', fondo: '#FBE9EC' },
  { numero: 'RUPN-2026-004450', etapa: 'Asignación', responsable: 'Sin asignar', tipo: 'Actualización del censo de integrantes', criticidad: 'Vence en 4 días', color: '#9D7700', fondo: '#FFFAE8' },
]

export default function P21Tablero() {
  return (
    <Layout backoffice ancho={1280} padding="0">
      <Sesion>Sesión de <strong>Marcela Duarte</strong> · Coordinadora · Dirección de Asuntos NARP</Sesion>
      <div style={{ padding: '24px 24px 64px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
          Tablero de gestión
        </h1>
        <Parrafo style={{ margin: '8px 0 0', maxWidth: '70ch' }}>
          Vista del mes. Los tiempos son del reloj del Ministerio; el tiempo del ciudadano se cuenta aparte.
        </Parrafo>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginTop: 20 }}>
          {KPIS.map((k) => (
            <div key={k.etiqueta} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: '16px 18px' }}>
              <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 30, lineHeight: '36px', color: 'var(--text-title)' }}>{k.valor}</span>
              <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-muted)', marginTop: 2 }}>{k.etiqueta}</span>
            </div>
          ))}
        </div>

        <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '24px', color: 'var(--text-title)', margin: '0 0 8px' }}>
            Casos por etapa
          </h2>
          <div style={{ display: 'flex', gap: 2, borderRadius: 6, overflow: 'hidden', height: 28 }} aria-hidden="true">
            {ETAPAS.map((e) => (
              <div key={e.titulo} style={{ flex: `${e.cantidad} ${e.cantidad} 0`, background: e.color }} title={e.titulo} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
            {ETAPAS.map((e) => (
              <span key={e.titulo} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-body)' }}>
                <span aria-hidden="true" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: e.color }} />
                {e.titulo} ({e.cantidad})
              </span>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '24px', color: 'var(--text-title)', margin: 0, padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            Casos en riesgo de incumplir término
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {RIESGO.map((r, i) => (
              <li
                key={r.numero}
                style={{
                  display: 'flex', gap: 16, alignItems: 'center', padding: '16px 20px',
                  ...(i < RIESGO.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-muted)' }}>
                    {r.numero} · {r.etapa} · responsable: {r.responsable}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', marginTop: 2 }}>
                    {r.tipo}
                  </span>
                </div>
                <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', background: r.fondo, color: r.color, border: `1px solid ${r.color}`, borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                  {r.criticidad}
                </span>
              </li>
            ))}
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
