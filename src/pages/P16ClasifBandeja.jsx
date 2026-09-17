import Layout from '../components/Layout.jsx'
import { Parrafo, BotonLink, Aviso, Vacio } from '../components/ui.jsx'
import { useDatos } from '../api/useDatos.js'
import { R, ruta } from '../routes.js'

// Respaldo cuando no hay backend: los casos del handoff, recién radicados.
const fecha = (v) =>
  v && !Number.isNaN(Date.parse(v))
    ? new Date(v).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : v

const RESPALDO = [
  { numero: 'RUPN-2026-005102', radicadoEl: '9 de septiembre de 2026', comunidad: 'Consejo Comunitario Guapi Abajo Unidos', tipo: 'Actualización del censo, o actualización de datos de contacto' },
  { numero: 'RUPN-2026-005098', radicadoEl: '9 de septiembre de 2026', comunidad: 'Consejo Comunitario del Bajo Baudó', tipo: 'Cambio de representante legal' },
  { numero: 'RUPN-2026-005110', radicadoEl: '10 de septiembre de 2026', comunidad: 'Consejo Comunitario del Río Naya', tipo: 'Registro de nueva junta directiva' },
]

export default function P16ClasifBandeja() {
  // La bandeja del backend ya trae solo lo pendiente de clasificar, del más antiguo al más reciente.
  const { datos: CASOS, cargando, error } = useDatos((api) => api.bandeja('clasificador'), RESPALDO)

  return (
    <Layout backoffice padding="24px 24px 64px">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Bandeja de clasificación
      </h1>
      <Parrafo style={{ margin: '8px 0 0', maxWidth: '70ch' }}>
        Solicitudes recién radicadas, con la categoría que propone el sistema. Los casos vencidos se priorizan.
      </Parrafo>

      {error && (
        <div style={{ marginTop: 16 }}>
          <Aviso tono="aviso" titulo="Mostrando datos de ejemplo">{error.mensaje ?? error.message}</Aviso>
        </div>
      )}

      {!cargando && CASOS.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <Vacio titulo="No hay casos por clasificar">
            Cuando lleguen solicitudes nuevas, aparecerán aquí.
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
                    {c.numero}{c.radicadoEl && ` · radicada el ${fecha(c.radicadoEl)}`}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', marginTop: 2 }}>
                    {c.comunidad ?? 'Comunidad sin identificar en el registro'}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                    Propuesta del sistema: {c.tipo}
                  </span>
                </div>
                {c.vencido && (
                  <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FBE9EC', color: '#A80521', border: '1px solid #A80521', borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                    <span aria-hidden="true" style={{ fontWeight: 700 }}>!</span>
                    Vencido
                  </span>
                )}
                <BotonLink variant="outline" to={ruta(R.clasificacionCaso, { radicado: c.numero })}>Clasificar</BotonLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Layout>
  )
}
