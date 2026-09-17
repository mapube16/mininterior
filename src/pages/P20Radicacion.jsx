import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Checkbox, RadioGroup, Select } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { Parrafo, Mudo } from '../components/ui.jsx'
import { R } from '../routes.js'

const COMUNIDADES = [
  'Consejo Comunitario Guapi Abajo Unidos (Guapi, Cauca)',
  'Consejo Comunitario del Bajo Baudó (Bajo Baudó, Chocó)',
  'Consejo Comunitario del Río Naya (Buenaventura, Valle del Cauca)',
]

const TIPOS = [
  'Cambió el representante legal',
  'Actualizar los datos de la comunidad',
  'Actualizar el listado censal',
  'Registrar una comunidad nueva',
]

export default function P20Radicacion() {
  const navegar = useNavigate()
  const [comunidad, setComunidad] = useState(null)
  const [tipo, setTipo] = useState(null)
  const [autorizado, setAutorizado] = useState(false)

  // TODO(backend): la radicación asistida usa el mismo formulario del ciudadano,
  // registrando en nombre de quién y quién autorizó.
  const continuar = () => navegar(`${R.tramiteDatos}?tipo=representante`)

  return (
    <Layout backoffice ancho={860} padding="0">
      <Sesion>Sesión de <strong>Rocío Paredes</strong> · Ventanilla · Punto de atención de Guapi</Sesion>
      <div style={{ padding: '32px 24px 64px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 42, lineHeight: '50px', color: 'var(--text-title)', margin: '0 0 8px' }}>
          Radicación asistida
        </h1>
        <Parrafo style={{ margin: '0 0 24px', maxWidth: '64ch' }}>
          Es el mismo formulario del ciudadano; queda registrado en nombre de quién radicas y se le notifica por el mismo
          canal que usaría si lo hiciera desde su casa.
        </Parrafo>

        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 24 }}>
          <Select
            label="En nombre de qué comunidad radicas"
            required
            placeholder="Busca la comunidad"
            options={COMUNIDADES}
            value={comunidad}
            onChange={setComunidad}
          />

          {comunidad && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
              <RadioGroup legend="¿Qué necesita hacer la comunidad?" options={TIPOS} value={tipo} onChange={setTipo} />
            </div>
          )}

          {tipo && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
              <Checkbox
                label="La comunidad autorizó a la ventanilla a radicar en su nombre."
                checked={autorizado}
                onChange={() => setAutorizado((v) => !v)}
              />
              <div style={{ marginTop: 16 }}>
                <Button disabled={!autorizado} onClick={continuar}>Continuar al paso 2</Button>
              </div>
            </div>
          )}
        </section>

        <Mudo style={{ margin: '20px 0 0' }}>
          La comunidad recibirá el número de radicado y las notificaciones de su solicitud en su correo y celular, igual
          que si la hubiera radicado ella misma.
        </Mudo>
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
