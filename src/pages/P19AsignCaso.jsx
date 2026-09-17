import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, TextField } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { Aviso, Parrafo, Mudo, Vacio } from '../components/ui.jsx'
import { api } from '../api/cliente.js'
import { useDatos } from '../api/useDatos.js'
import { buscarCaso } from '../mock/datos.js'
import { R } from '../routes.js'

// Respaldo de la propuesta cuando no hay backend. El sistema PROPONE, no impone: sugiere
// un asesor con su justificación y la mesa decide.
const RESPALDO_PROPUESTA = {
  asesor_id: null,
  asesor_nombre: 'Daniel Perea',
  justificacion: 'ya conoce esta comunidad (llevó el cambio de representante legal en agosto) y tiene la menor carga del equipo de Cauca.',
  alerta: null,
}

export default function P19AsignCaso() {
  const { radicado } = useParams()
  const navegar = useNavigate()
  const { datos: caso, cargando } = useDatos((a) => a.caso(radicado), buscarCaso(radicado), [radicado])
  const { datos: propuesta } = useDatos((a) => a.propuestaAsesor(radicado), RESPALDO_PROPUESTA, [radicado])

  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [asignado, setAsignado] = useState(null)
  const [error, setError] = useState(null)

  if (!caso && !cargando) {
    return (
      <Layout backoffice>
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja de asignación.{' '}
          <Link to={R.asignacionBandeja}>Volver a la bandeja</Link>
        </Vacio>
      </Layout>
    )
  }
  if (!caso) return <Layout backoffice><Mudo>Cargando el caso…</Mudo></Layout>

  // Sin asesor propuesto no se puede aceptar la propuesta: el backend responde 409.
  const hayPropuesta = Boolean(propuesta?.asesor_nombre)

  const asignar = async () => {
    setEnviando(true)
    setError(null)
    try {
      const r = await api.asignar(caso.numero, {
        asesor_id: propuesta?.asesor_id ?? null,
        motivo: motivo || null,
      })
      setAsignado(propuesta?.asesor_nombre ?? r.responsableId)
      setTimeout(() => navegar(R.asignacionBandeja), 1200)
    } catch (e) {
      setError(e.mensaje ?? e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Layout backoffice padding="24px 24px 64px">
      <Migas items={[{ label: 'Bandeja de asignación', href: R.asignacionBandeja }, { label: caso.numero }]} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '12px 0 0' }}>
        Pantalla de asignación
      </h1>
      <Parrafo style={{ margin: '8px 0 24px', maxWidth: '70ch' }}>
        {caso.numero} · {caso.tipo} · {caso.comunidad}
      </Parrafo>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '24px', color: 'var(--text-title)', margin: 0 }}>
              Propuesta de asignación
            </h2>

            {/* El sistema propone y explica por qué; la mesa decide. */}
            {hayPropuesta ? (
              <Parrafo style={{ margin: '10px 0 0' }}>
                <strong>{propuesta.asesor_nombre}</strong> — {propuesta.justificacion}
              </Parrafo>
            ) : (
              <Parrafo style={{ margin: '10px 0 0' }}>{propuesta?.justificacion ?? 'Sin propuesta del sistema.'}</Parrafo>
            )}

            {propuesta?.alerta && (
              <div style={{ marginTop: 12 }}>
                <Aviso tono="aviso" titulo="Atención">{propuesta.alerta}</Aviso>
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <TextField
                label="Motivo o nota de la asignación (opcional)"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <Button disabled={enviando || asignado != null} onClick={asignar}>
                {hayPropuesta ? `Asignar a ${propuesta.asesor_nombre}` : 'Confirmar asignación'}
              </Button>
            </div>

            {error && <div style={{ marginTop: 12 }}><Aviso tono="error" titulo="No pudimos asignar el caso">{error}</Aviso></div>}

            {asignado && (
              <div style={{ marginTop: 12 }}>
                <Aviso tono="exito" titulo="Asignado">Asignado a <strong>{asignado}</strong>. El caso pasa a su bandeja.</Aviso>
              </div>
            )}
          </section>
        </div>

        <aside style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, minWidth: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>Cómo se eligió</h2>
          <Mudo style={{ marginTop: 10 }}>
            La propuesta pondera carga activa, territorio y experiencia previa con la comunidad. Queda registrada junto con
            tu decisión, aceptes o no la sugerencia.
          </Mudo>
        </aside>
      </div>
    </Layout>
  )
}
