import { useState } from 'react'
import { Button, Select, TextField } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { Parrafo, Mudo } from '../components/ui.jsx'

const COMUNIDADES = [
  'Consejo Comunitario Guapi Abajo Unidos (Guapi, Cauca)',
  'Consejo Comunitario del Bajo Baudó (Bajo Baudó, Chocó)',
  'Consejo Comunitario del Río Naya (Buenaventura, Valle del Cauca)',
]

// Lo que el sistema extrae del documento capturado. El funcionario lo revisa y
// corrige antes de confirmar: la extracción propone, no decide.
const EXTRAIDO = {
  comunidad: 'Consejo Comunitario Guapi Abajo Unidos (Guapi, Cauca)',
  tipoDetectado: 'Actualizar los datos de la comunidad',
  fecha: '8 de septiembre de 2026',
}

export default function P30Digitalizacion() {
  const [archivo, setArchivo] = useState(null)
  const [comunidad, setComunidad] = useState(EXTRAIDO.comunidad)
  const [tipoDetectado, setTipoDetectado] = useState(EXTRAIDO.tipoDetectado)
  const [fecha, setFecha] = useState(EXTRAIDO.fecha)
  const [enviado, setEnviado] = useState(false)

  // TODO(backend): subir la imagen y extraer los campos del documento (OCR).
  const onArchivo = (e) => {
    const f = e.target.files && e.target.files[0]
    if (f) setArchivo(f.name)
  }

  // TODO(backend): radicar la entrada física; entra al mismo flujo que una digital.
  const enviar = () => setEnviado(true)

  return (
    <Layout backoffice ancho={860} padding="0">
      <Sesion>Sesión de <strong>Rocío Paredes</strong> · Ventanilla · Punto de atención de Guapi</Sesion>
      <div style={{ padding: '32px 24px 64px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '0 0 8px' }}>
          Digitalizar una solicitud recibida por otro canal
        </h1>
        <Parrafo style={{ margin: '0 0 24px', maxWidth: '64ch' }}>
          Para lo que llega en papel o por correo físico. Entra al mismo flujo que una solicitud digital; no hay un
          proceso paralelo.
        </Parrafo>

        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 24 }}>
          {!archivo ? (
            <label
              htmlFor="archivo-fisico"
              style={{ display: 'flex', alignItems: 'center', gap: 14, border: '1px dashed var(--border-subtle)', borderRadius: 8, padding: '18px 16px', cursor: 'pointer', background: 'var(--surface-page)', position: 'relative' }}
            >
              <span aria-hidden="true" style={{ flex: 'none', color: 'var(--color-cobalt)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15V4M8 8l4-4 4 4" />
                  <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                </svg>
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-body)' }}>
                Escanea o fotografía el documento recibido
              </span>
              <input
                id="archivo-fisico"
                type="file"
                accept="image/*,.pdf"
                onChange={onArchivo}
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
              />
            </label>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-page)', padding: '14px 16px' }}>
                <span aria-hidden="true" style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', background: '#E6F3EE', color: '#158361', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  ✓
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)' }}>{archivo}</span>
              </div>
              <Mudo style={{ fontSize: 13, lineHeight: '20px', margin: '14px 0 10px' }}>
                El sistema extrajo estos campos automáticamente. Revísalos antes de continuar.
              </Mudo>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Select label="Comunidad" options={COMUNIDADES} value={comunidad} onChange={setComunidad} />
                <TextField
                  label="Tipo de trámite detectado"
                  value={tipoDetectado}
                  onChange={(e) => setTipoDetectado(e.target.value)}
                  help="Extraído del encabezado del documento; corrígelo si no es correcto."
                />
                <TextField label="Fecha del documento" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div style={{ marginTop: 16 }}>
                <Button onClick={enviar}>Radicar en el sistema</Button>
              </div>
            </div>
          )}

          {enviado && (
            <div style={{ marginTop: 16, border: '1px solid #158361', borderLeft: '4px solid #158361', borderRadius: 8, background: '#E6F3EE', padding: '14px 16px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
                Radicado. La solicitud entra a clasificación como cualquier otra, con el número <strong>RUPN-2026-005210</strong>.
              </p>
            </div>
          )}
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
