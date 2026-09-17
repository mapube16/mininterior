import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, RadioGroup, TextField } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { BotonLink, Vacio } from '../components/ui.jsx'
import { buscarCaso } from '../mock/datos.js'
import { R } from '../routes.js'

/** Cada estado terminal cierra por una razón distinta y lleva su propia plantilla de motivación. */
const TERMINALES = {
  Desfavorable: {
    ayuda: 'El trámite se decide en contra de lo solicitado. Se notifica con los recursos disponibles.',
    plantilla: 'La solicitud se decide de manera desfavorable porque ',
  },
  Desistida: {
    ayuda: 'El ciudadano no respondió al requerimiento dentro del plazo. El caso se cierra sin decisión de fondo.',
    plantilla: 'Se declara el desistimiento porque el requerimiento del ',
  },
  Archivada: {
    ayuda: 'El caso no procede por una razón administrativa (por ejemplo, ya existe una solicitud igual en trámite).',
    plantilla: 'Se archiva la solicitud porque ',
  },
  Trasladada: {
    ayuda: 'El asunto no es competencia de esta Dirección; se traslada a la entidad correspondiente.',
    plantilla: 'Se traslada el asunto a ',
  },
}

const ESTADOS_TERMINALES = Object.keys(TERMINALES)

export default function P29Cierre() {
  const { radicado } = useParams()
  const caso = buscarCaso(radicado)

  const [estado, setEstado] = useState(null)
  const [motivacion, setMotivacion] = useState('')
  const [cerrado, setCerrado] = useState(false)

  if (!caso) {
    return (
      <Layout backoffice ancho={860} padding="32px 24px 64px">
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja de revisión.{' '}
          <BotonLink variant="outline" to={R.revisionBandeja}>Volver a la bandeja</BotonLink>
        </Vacio>
      </Layout>
    )
  }

  // Cambiar de estado arranca de su plantilla propia y descarta el cierre anterior.
  const elegirEstado = (v) => {
    setEstado(v)
    setMotivacion(TERMINALES[v].plantilla)
    setCerrado(false)
  }

  const cerrar = () => {
    // TODO(backend): cerrar el caso en el estado terminal elegido y notificar con su plantilla.
    setCerrado(true)
  }

  return (
    <Layout backoffice ancho={860} padding="32px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Elena Vargas</strong> · Revisora · Dirección de Asuntos NARP
      </p>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: 0 }}>
        {caso.numero} · {caso.tipo}
      </p>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '6px 0 24px' }}>
        Cierre por estado terminal
      </h1>

      <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 24 }}>
        <RadioGroup legend="Estado terminal" options={ESTADOS_TERMINALES} value={estado} onChange={elegirEstado} />

        {estado && (
          <div style={{ marginTop: 18, borderTop: '1px solid var(--border-subtle)', paddingTop: 18 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
              {TERMINALES[estado].ayuda}
            </p>
            <TextField
              label="Motivación"
              multiline
              value={motivacion}
              onChange={(e) => setMotivacion(e.target.value)}
            />
            <div style={{ marginTop: 16 }}>
              <Button disabled={!motivacion.trim() || cerrado} onClick={cerrar}>Cerrar caso</Button>
            </div>
          </div>
        )}

        {cerrado && (
          <div style={{ marginTop: 16, border: '1px solid #158361', borderLeft: '4px solid #158361', borderRadius: 8, background: '#E6F3EE', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
              <span aria-hidden="true">✓ </span>Caso cerrado como <strong>{estado}</strong>. Se notifica a la comunidad con la
              plantilla correspondiente.
            </p>
          </div>
        )}
      </section>
    </Layout>
  )
}
