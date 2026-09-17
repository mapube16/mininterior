import Layout from '../components/Layout.jsx'
import { Parrafo, BotonLink } from '../components/ui.jsx'
import { R, ruta } from '../routes.js'

// Casos del handoff: recién radicados, con la categoría que propone el sistema.
const CASOS = [
  { numero: 'RUPN-2026-005102', fecha: '9 de septiembre de 2026', comunidad: 'Consejo Comunitario Guapi Abajo Unidos', propuesta: 'Actualización del censo, o actualización de datos de contacto', ambiguo: true },
  { numero: 'RUPN-2026-005098', fecha: '9 de septiembre de 2026', comunidad: 'Consejo Comunitario del Bajo Baudó', propuesta: 'Cambio de representante legal', ambiguo: false },
  { numero: 'RUPN-2026-005110', fecha: '10 de septiembre de 2026', comunidad: 'Consejo Comunitario del Río Naya', propuesta: 'Registro de nueva junta directiva', ambiguo: false },
]

export default function P16ClasifBandeja() {
  return (
    <Layout backoffice padding="0">
      <Sesion>Sesión de <strong>Sandra Molano</strong> · Clasificadora · Dirección de Asuntos NARP</Sesion>
      <div style={{ padding: '24px 24px 64px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
          Bandeja de clasificación
        </h1>
        <Parrafo style={{ margin: '8px 0 0', maxWidth: '70ch' }}>
          Solicitudes recién radicadas, con la categoría que propone el sistema. Los casos ambiguos se priorizan.
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
                    {c.numero} · radicada el {c.fecha}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', marginTop: 2 }}>
                    {c.comunidad}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                    Propuesta del sistema: {c.propuesta}
                  </span>
                </div>
                {c.ambiguo && (
                  <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FBE9EC', color: '#A80521', border: '1px solid #A80521', borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                    Ambiguo
                  </span>
                )}
                <BotonLink variant="outline" to={ruta(R.clasificacionCaso, { radicado: c.numero })}>Clasificar</BotonLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  )
}

/** Franja de sesión del funcionario, encima del contenido (va en todas las pantallas de back office). */
function Sesion({ children }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-subtle)' }}>
      <div style={{ padding: '12px 24px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)' }}>
        {children}
      </div>
    </div>
  )
}
