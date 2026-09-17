import Layout from '../components/Layout.jsx'
import { Parrafo, BotonLink, Aviso, Vacio } from '../components/ui.jsx'
import { useDatos } from '../api/useDatos.js'
import { R, ruta } from '../routes.js'

// Respaldo cuando no hay backend: los casos ya clasificados del handoff.
const RESPALDO = [
  { numero: 'RUPN-2026-005102', tipo: 'Actualización del censo de integrantes', comunidad: 'Consejo Comunitario Guapi Abajo Unidos', lugar: 'Guapi, Cauca' },
  { numero: 'RUPN-2026-005098', tipo: 'Cambio de representante legal', comunidad: 'Consejo Comunitario del Bajo Baudó', lugar: 'Pizarro, Chocó' },
]

export default function P18AsignBandeja() {
  // La mesa ve los casos ya clasificados, del más antiguo al más reciente.
  const { datos: CASOS, cargando, error } = useDatos((api) => api.bandeja('mesa'), RESPALDO)

  return (
    <Layout backoffice padding="24px 24px 64px">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Bandeja de asignación
      </h1>
      <Parrafo style={{ margin: '8px 0 0', maxWidth: '70ch' }}>
        Casos ya clasificados. Al abrir cada uno, el sistema propone un asesor según carga, territorio y especialidad.
      </Parrafo>

      {error && (
        <div style={{ marginTop: 16 }}>
          <Aviso tono="aviso" titulo="Mostrando datos de ejemplo">{error.mensaje ?? error.message}</Aviso>
        </div>
      )}

      {!cargando && CASOS.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <Vacio titulo="No hay casos por asignar">
            Cuando clasificación libere un caso, aparecerá aquí.
          </Vacio>
        </div>
      ) : (
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
                    {c.diasRestantes != null && ` · ${c.vencido ? `vencido hace ${Math.abs(c.diasRestantes)} días hábiles` : `quedan ${c.diasRestantes} días hábiles`}`}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', marginTop: 2 }}>
                    {c.comunidad}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                    {c.lugar}
                  </span>
                </div>
                {c.vencido && (
                  <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FBE9EC', color: '#A80521', border: '1px solid #A80521', borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                    <span aria-hidden="true" style={{ fontWeight: 700 }}>!</span>
                    Vencido
                  </span>
                )}
                <BotonLink variant="outline" to={ruta(R.asignacionCaso, { radicado: c.numero })}>Asignar</BotonLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Layout>
  )
}
