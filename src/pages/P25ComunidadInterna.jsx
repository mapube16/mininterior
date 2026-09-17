import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { Mudo, Vacio } from '../components/ui.jsx'
import { buscarComunidad } from '../mock/datos.js'
import { R } from '../routes.js'

// Ficha INTERNA: a diferencia de la pública (P3), sí muestra dirigentes, cronología
// y alertas de cruce. Estos datos no viven en datos.js porque solo se ven aquí.
const ALERTA =
  'Arnulfo Hurtado, propuesto como nuevo representante en RUPN-2026-004871, también aparece como representante vigente del Consejo Comunitario del Río Naya. Verificar antes de aprobar.'

const REPRESENTANTES = [
  { nombre: 'Fundador: Josefina Palacios', periodo: '2003 – 2019' },
  { nombre: 'Rosalba Mosquera', periodo: '2019 – 2026 (saliente)' },
  { nombre: 'Arnulfo Hurtado (propuesto)', periodo: 'Desde 2026, pendiente de aprobación' },
]

const ACTOS = [
  { titulo: 'Acto de constitución de la comunidad', fecha: 'Resolución 0512 del 4 de mayo de 2003' },
  { titulo: 'Cambio de representante legal', fecha: 'Resolución 2890 del 11 de junio de 2019' },
  { titulo: 'Actualización de linderos', fecha: 'Resolución 3402 del 20 de febrero de 2023' },
]

const SOLICITUDES_ASOCIADAS = [
  { numero: 'RUPN-2026-004871', tipo: 'Cambio de representante legal', estado: '! Requiere acción del ciudadano', color: '#A80521', fondo: '#FBE9EC' },
  { numero: 'RUPN-2026-005102', tipo: 'Actualización del censo de integrantes', estado: '↻ En asignación', color: '#9D7700', fondo: '#FFFAE8' },
]

const DATOS_INTERNOS = [
  { k: 'Representante legal actual', v: 'Rosalba Mosquera' },
  { k: 'Número de familias censadas', v: '128 (2023) → 134 (propuesto, 2026)' },
]

export default function P25ComunidadInterna() {
  const { id } = useParams()
  const comunidad = buscarComunidad(id)

  if (!comunidad) {
    return (
      <Layout backoffice>
        <Vacio titulo="No encontramos esa comunidad">
          La comunidad {id} no está en el registro. <Link to={R.busquedaGlobal}>Ir a la búsqueda global</Link>
        </Vacio>
      </Layout>
    )
  }

  const datos = [
    { k: 'Tipo de organización', v: comunidad.tipo },
    { k: 'Municipio', v: comunidad.municipio },
    { k: 'Departamento', v: comunidad.departamento },
    { k: 'Estado en el registro', v: comunidad.estado },
    ...DATOS_INTERNOS,
  ]

  return (
    <Layout backoffice padding="24px 24px 64px">
      <Mudo>Ficha interna · no es la vista pública</Mudo>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '6px 0 0' }}>
        {comunidad.nombre}
      </h1>
      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, lineHeight: '28px', color: 'var(--text-body)', margin: '8px 0 0' }}>
        {comunidad.municipio}, {comunidad.departamento}
      </p>

      <div style={{ marginTop: 20, border: '1px solid var(--border-subtle)', borderLeft: '4px solid #A80521', borderRadius: 8, background: '#FBE9EC', padding: '14px 16px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
          <strong>Alerta:</strong> {ALERTA}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 24, marginTop: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
            <Encabezado>Cronología de representantes</Encabezado>
            <ol style={{ listStyle: 'none', margin: 0, padding: 20 }}>
              {REPRESENTANTES.map((r, i) => (
                <li key={r.nombre} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 16 }}>
                  <span aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--color-cobalt)' }} />
                    {i < REPRESENTANTES.length - 1 && (
                      <span style={{ flex: 1, width: 2, background: 'var(--border-subtle)', minHeight: 24 }} />
                    )}
                  </span>
                  <span style={{ display: 'block', paddingBottom: 20 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>{r.nombre}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>{r.periodo}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
            <Encabezado>Actos administrativos</Encabezado>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {ACTOS.map((a, i) => (
                <li
                  key={a.titulo}
                  style={{ padding: '14px 20px', ...(i < ACTOS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null) }}
                >
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>{a.titulo}</span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>{a.fecha}</span>
                </li>
              ))}
            </ul>
          </section>

          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
            <Encabezado>Solicitudes asociadas</Encabezado>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {SOLICITUDES_ASOCIADAS.map((s, i) => (
                <li
                  key={s.numero}
                  style={{
                    display: 'flex', gap: 16, alignItems: 'center', padding: '16px 20px',
                    ...(i < SOLICITUDES_ASOCIADAS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-muted)' }}>{s.numero}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', marginTop: 2 }}>{s.tipo}</span>
                  </div>
                  <span style={{ flex: 'none', background: s.fondo, color: s.color, border: `1px solid ${s.color}`, borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                    {s.estado}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, minWidth: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: '0 0 12px' }}>Datos completos</h2>
          <dl style={{ margin: 0 }}>
            {datos.map((d) => (
              <div key={d.k} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <dt style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{d.k}</dt>
                <dd style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)', margin: '4px 0 0' }}>{d.v}</dd>
              </div>
            ))}
          </dl>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '18px', color: 'var(--text-muted)', margin: '14px 0 0' }}>
            Los dirigentes, contactos, censo detallado y coordenadas solo se ven aquí, nunca en la ficha pública.
          </p>
        </aside>
      </div>
    </Layout>
  )
}

function Encabezado({ children }) {
  return (
    <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '24px', color: 'var(--text-title)', margin: 0, padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
      {children}
    </h2>
  )
}
