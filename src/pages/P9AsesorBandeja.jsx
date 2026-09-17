import Layout from '../components/Layout.jsx'
import { BotonLink } from '../components/ui.jsx'
import { CASOS } from '../mock/datos.js'
import { R, ruta } from '../routes.js'

// Solo los casos ya asignados a un asesor entran a esta bandeja, del más antiguo al más reciente.
const ASIGNADOS = CASOS.filter((c) => c.asesor)

export default function P9AsesorBandeja() {
  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Daniel Perea</strong> · Asesor · Dirección de Asuntos NARP
      </p>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Bandeja del asesor
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
        Casos asignados, del más antiguo al más reciente. Los que ya volvieron de pre-revisión se marcan aparte.
      </p>

      <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {ASIGNADOS.map((c, i) => (
            <li
              key={c.numero}
              style={{
                display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
                ...(i < ASIGNADOS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-muted)' }}>
                  {c.numero} · {c.antiguedad}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', marginTop: 2 }}>
                  {c.tipo}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                  {c.comunidad} · {c.lugar}
                </span>
              </div>
              {c.retornos > 0 && (
                <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFFAE8', color: '#9D7700', border: '1px solid #9D7700', borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                  <span aria-hidden="true" style={{ fontWeight: 700 }}>↻</span>
                  Retorno de pre-revisión ×{c.retornos}
                </span>
              )}
              <BotonLink variant="outline" to={ruta(R.asesorCaso, { radicado: c.numero })}>Analizar</BotonLink>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
