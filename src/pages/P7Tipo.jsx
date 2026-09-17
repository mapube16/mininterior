import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ProgressSteps } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { PASOS_TRAMITE, PieTramite } from './P7Datos.jsx'
// ponytail: el pie y los pasos del asistente viven en P7Datos.jsx; los cuatro pasos los comparten.
import { R } from '../routes.js'

// Ids propios del prototipo: los formularios del paso 2 se indexan con estos,
// no con los de TIPOS_TRAMITE de datos.js (ver reporte).
const OPCIONES = [
  { id: 'representante', titulo: 'Cambió nuestro representante legal', detalle: 'Cuando la comunidad eligió una nueva junta o un nuevo representante.', icono: 'person' },
  { id: 'datos', titulo: 'Actualizar los datos de la comunidad', detalle: 'Cambio de sede, de nombre o de datos de contacto.', icono: 'pencil' },
  { id: 'censo', titulo: 'Actualizar el listado censal', detalle: 'Cuando cambió el número de familias o de personas.', icono: 'people' },
  { id: 'nueva', titulo: 'Registrar una comunidad nueva', detalle: 'Es la primera vez que la comunidad entra al registro.', icono: 'plus' },
]

const GLIFOS = {
  person: 'M12 4.5a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8ZM5.5 19.5c0-3.2 2.9-5.2 6.5-5.2s6.5 2 6.5 5.2',
  pencil: 'M4.5 19.5h4L20 8a2.1 2.1 0 0 0-3-3L5.5 16.5v3ZM15 6.5l2.5 2.5',
  people: 'M9 5.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM3.5 19c0-2.9 2.5-4.7 5.5-4.7s5.5 1.8 5.5 4.7M16 6.2a2.6 2.6 0 0 1 0 5.2M17.5 14.6c1.9.5 3 1.9 3 3.6',
  plus: 'M12 5v14M5 12h14',
}

const MENSAJES = {
  representante: 'Vas a avisar que cambió el representante legal. En el paso 2 nos cuentas cuándo fue la asamblea.',
  datos: 'Vas a actualizar los datos de la comunidad. En el paso 2 escoges qué dato cambió.',
  censo: 'Vas a actualizar el listado censal. En el paso 2 te pedimos el número de familias.',
  nueva: 'Vas a registrar una comunidad nueva. En el paso 2 empezamos por el nombre y el municipio.',
  duda: 'Te hacemos tres preguntas cortas y al final te decimos cuál es tu trámite. No pierdes lo que ya escribiste.',
}

const CAJA = {
  display: 'flex', gap: 18, alignItems: 'center', width: '100%', boxSizing: 'border-box', minHeight: 96,
  padding: '20px 22px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
  transition: 'background .12s,border-color .12s', borderWidth: 1, borderStyle: 'solid',
}

export default function P7Tipo() {
  const navegar = useNavigate()
  const [sel, setSel] = useState(null)

  const continuar = () => {
    if (sel === 'duda') return // el cuestionario de tres preguntas no está en la maqueta
    navegar(`${R.tramiteDatos}?tipo=${sel}`)
  }

  return (
    <Layout ancho={860} padding="32px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '0 0 12px' }}>Paso 1 de 5</p>
      <ProgressSteps steps={PASOS_TRAMITE} current={0} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 42, lineHeight: '50px', color: 'var(--text-title)', margin: '28px 0 8px' }}>
        ¿Qué necesitas hacer?
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '0 0 24px', maxWidth: '64ch' }}>
        Escoge la opción que más se parezca a lo que pasó en tu comunidad. Si ninguna encaja, la última opción te ayuda a
        encontrarla.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {OPCIONES.map((o) => {
          const on = sel === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setSel(o.id)}
              aria-pressed={on}
              style={{
                ...CAJA,
                borderColor: on ? 'var(--color-cobalt)' : 'var(--border-subtle)',
                background: on ? 'var(--surface-info)' : 'var(--surface-card)',
                ...(on ? { boxShadow: 'inset 0 0 0 1px var(--color-cobalt)' } : null),
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: 'none', width: 48, height: 48, borderRadius: 8, border: '1px solid var(--border-subtle)',
                  color: 'var(--color-cobalt)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-card)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={GLIFOS[o.icono]} />
                </svg>
              </span>
              <span style={{ display: 'block', textAlign: 'left' }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, lineHeight: '30px', color: 'var(--text-title)' }}>{o.titulo}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', marginTop: 4 }}>{o.detalle}</span>
              </span>
              <span aria-hidden="true" style={{ marginLeft: 'auto', color: 'var(--color-cobalt)', flex: 'none' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 5.5 16 12l-6.5 6.5" />
                </svg>
              </span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setSel('duda')}
          aria-pressed={sel === 'duda'}
          style={{ ...CAJA, borderColor: 'var(--color-golden-brown)', background: 'var(--surface-notice)', borderStyle: 'dashed' }}
        >
          <span
            aria-hidden="true"
            style={{
              flex: 'none', width: 48, height: 48, borderRadius: 8, border: '1px solid var(--color-golden-brown)',
              color: 'var(--color-golden-brown)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.4 9.2A2.7 2.7 0 0 1 14.6 10c0 1.8-2.6 2-2.6 3.6" />
              <path d="M12 17v.5" />
            </svg>
          </span>
          <span style={{ display: 'block', textAlign: 'left' }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, lineHeight: '30px', color: 'var(--text-title)' }}>No estoy seguro</span>
            <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', marginTop: 4 }}>
              Te hacemos tres preguntas y lo averiguamos juntos.
            </span>
          </span>
          <span aria-hidden="true" style={{ marginLeft: 'auto', color: 'var(--color-golden-brown)', flex: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 5.5 16 12l-6.5 6.5" />
            </svg>
          </span>
        </button>
      </div>

      {sel && (
        <div
          style={{
            marginTop: 24, border: '1px solid var(--border-subtle)', borderLeft: '4px solid var(--color-green)', borderRadius: 8,
            background: '#E6F3EE', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', gap: 20,
            alignItems: 'center', flexWrap: 'wrap',
          }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: 0, maxWidth: '60ch' }}>
            {MENSAJES[sel]}
          </p>
          {sel === 'duda' ? (
            <Button disabled>Continuar al paso 2</Button>
          ) : (
            <Button onClick={continuar}>Continuar al paso 2</Button>
          )}
        </div>
      )}

      <PieTramite />
    </Layout>
  )
}
