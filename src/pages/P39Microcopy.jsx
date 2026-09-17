import { useState } from 'react'
import { Button, TextField } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { Aviso } from '../components/ui.jsx'

// Textos del ciudadano: se editan aquí, sin tocar código.
const TEXTOS_INICIALES = [
  { clave: 'Nombre del trámite: cambio de representante', valor: 'Cambió nuestro representante legal' },
  { clave: 'Ayuda del buscador en el inicio', valor: 'Por ejemplo: Guapi, Bajo Baudó, consejo comunitario del Atrato.' },
  { clave: 'Error: documento ilegible', valor: 'No pudimos leer bien la foto. Vuelve a tomarla con más luz.' },
  { clave: 'Notificación: solicitud aprobada', valor: 'Tu solicitud quedó aprobada. Puedes descargar la resolución.' },
  { clave: 'Línea de ayuda telefónica', valor: '01 8000 000 000' },
]

export default function P39Microcopy() {
  const [valores, setValores] = useState(TEXTOS_INICIALES.map((t) => t.valor))
  const [guardado, setGuardado] = useState(false)

  const cambiar = (i, v) => {
    setValores((prev) => prev.map((x, j) => (j === i ? v : x)))
    setGuardado(false)
  }

  // TODO(backend): guardar publica los textos en el portal ciudadano de inmediato.
  const guardar = () => setGuardado(true)

  return (
    <Layout backoffice ancho={860} padding="32px 24px 64px">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Textos y microcopy
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 24px', maxWidth: '64ch' }}>
        Los textos que ve el ciudadano: nombres de trámites, ayudas, errores y notificaciones. Se edita aquí, sin tocar código.
      </p>

      {guardado && (
        <div style={{ marginBottom: 16 }}>
          <Aviso tono="exito" titulo="Textos guardados">
            Se publican en el portal ciudadano de inmediato.
          </Aviso>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {TEXTOS_INICIALES.map((t, i) => (
          <div key={t.clave} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 16 }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {t.clave}
            </span>
            <TextField label={t.clave} value={valores[i]} onChange={(e) => cambiar(i, e.target.value)} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <Button onClick={guardar}>Guardar cambios</Button>
      </div>
    </Layout>
  )
}
