import Layout from '../components/Layout.jsx'
import { Aviso, BotonLink, Vacio } from '../components/ui.jsx'
import { useDatos } from '../api/useDatos.js'
import { buscarCaso } from '../mock/datos.js'
import { R, ruta } from '../routes.js'

// Caso propio de la bandeja de revisión: no está en CASOS de datos.js (ver reporte del port).
const RIO_NAYA = {
  numero: 'RUPN-2026-004320',
  tipo: 'Cambio de representante legal',
  comunidad: 'Consejo Comunitario del Río Naya',
  lugar: 'Buenaventura, Valle del Cauca',
  retornos: 0,
}

// Respaldo cuando no hay backend: lo que ya pasó por el asesor y espera revisión final.
const RESPALDO = [buscarCaso('RUPN-2026-004871'), RIO_NAYA]

export default function P12RevisionBandeja() {
  const { datos: EN_REVISION, cargando, error } = useDatos((api) => api.bandeja('revisor'), RESPALDO)

  return (
    <Layout backoffice padding="24px 24px 64px">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Bandeja de revisión
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
        Proyecciones listas para tu revisión final. Los que ya tuvieron un retorno interno no pueden devolverse otra vez.
      </p>

      {error && (
        <div style={{ marginTop: 16 }}>
          <Aviso tono="aviso" titulo="Mostrando datos de ejemplo">{error.mensaje ?? error.message}</Aviso>
        </div>
      )}

      {!cargando && EN_REVISION.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <Vacio titulo="No hay casos por revisar">
            Cuando un asesor envíe una proyección, aparecerá aquí.
          </Vacio>
        </div>
      ) : (
        <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {EN_REVISION.map((c, i) => (
              <li
                key={c.numero}
                style={{
                  display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
                  ...(i < EN_REVISION.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-muted)' }}>
                    {c.numero}
                    {c.diasRestantes != null && ` · ${c.vencido ? `vencido hace ${Math.abs(c.diasRestantes)} días hábiles` : `quedan ${c.diasRestantes} días hábiles`}`}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', marginTop: 2 }}>
                    {c.tipo}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                    {c.comunidad} · {c.lugar}
                  </span>
                </div>
                {c.retornos > 0 && (
                  <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                    Con un retorno ya resuelto
                  </span>
                )}
                <BotonLink variant="outline" to={ruta(R.revisionCaso, { radicado: c.numero })}>Revisar</BotonLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Layout>
  )
}
