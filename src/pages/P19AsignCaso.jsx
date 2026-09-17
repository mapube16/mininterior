import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, RadioGroup, TextField } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { Parrafo, Mudo, Vacio } from '../components/ui.jsx'
import { buscarCaso } from '../mock/datos.js'
import { R } from '../routes.js'

// El sistema PROPONE, no impone: sugiere un asesor con su justificación y arma el
// expediente automático; la mesa puede excluir antecedentes o forzar otra búsqueda.
const PROPUESTO = 'Daniel Perea'
const JUSTIFICACION = 'ya conoce esta comunidad (llevó el cambio de representante legal en agosto) y tiene la menor carga del equipo de Cauca.'
const ASESORES = ['Daniel Perea', 'María Zapata', 'Carlos Renteria']

const ANTECEDENTES = [
  { titulo: 'Acto de constitución de la comunidad', fecha: 'Resolución 0512 del 4 de mayo de 2003' },
  { titulo: 'Cambio de representante legal', fecha: 'Resolución 4187 del 27 de agosto de 2026' },
  { titulo: 'Actualización de linderos', fecha: 'Resolución 3402 del 20 de febrero de 2023' },
]

const CARGA = [
  { nombre: 'Daniel Perea', casos: 3 },
  { nombre: 'María Zapata', casos: 5 },
  { nombre: 'Carlos Renteria', casos: 2 },
]

export default function P19AsignCaso() {
  const { radicado } = useParams()
  const caso = buscarCaso(radicado)
  const [asesor, setAsesor] = useState(PROPUESTO)
  const [motivoReasignacion, setMotivoReasignacion] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [excluidos, setExcluidos] = useState([])
  const [nota, setNota] = useState(null)

  if (!caso) {
    return (
      <Layout backoffice>
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja de asignación.{' '}
          <Link to={R.asignacionBandeja}>Volver a la bandeja</Link>
        </Vacio>
      </Layout>
    )
  }

  const visibles = ANTECEDENTES.filter((a) => !excluidos.includes(a.titulo))
  const mostrarMotivo = asesor !== PROPUESTO

  const cambiarAsesor = (v) => {
    setAsesor(v)
    setConfirmado(false)
  }

  // TODO(backend): confirmar la asignación pasa el caso a la bandeja del asesor.
  const confirmar = () => setConfirmado(true)

  // TODO(backend): marcar conflicto de interés devuelve el caso a la mesa para reasignar.
  const marcarConflicto = () => setNota('Marcado como conflicto de interés. La mesa debe reasignar a otro asesor.')

  // TODO(backend): volver a consultar el histórico de la comunidad.
  const forzarBusqueda = () => setNota('Buscando de nuevo en el histórico de la comunidad.')

  // TODO(backend): agregar manualmente un documento al expediente.
  const agregarDocumento = () => setNota('En esta maqueta, agregar un documento manualmente no está construido.')

  const excluir = (titulo) => setExcluidos((xs) => [...xs, titulo])

  return (
    <Layout backoffice padding="0">
      <Sesion>Sesión de <strong>Julián Ospina</strong> · Mesa de asignación · Dirección de Asuntos NARP</Sesion>
      <div style={{ padding: '24px 24px 64px' }}>
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
              <Parrafo style={{ margin: '10px 0 0' }}>
                <strong>{PROPUESTO}</strong> — {JUSTIFICACION}
              </Parrafo>
              <div style={{ marginTop: 14 }}>
                <RadioGroup legend="Asesor" options={ASESORES} value={asesor} onChange={cambiarAsesor} />
              </div>
              {mostrarMotivo && (
                <div style={{ marginTop: 12 }}>
                  <TextField label="Motivo de la reasignación" value={motivoReasignacion} onChange={(e) => setMotivoReasignacion(e.target.value)} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                <Button onClick={confirmar}>Confirmar asignación</Button>
                <Button variant="outline" onClick={marcarConflicto}>Marcar conflicto de interés</Button>
              </div>
              {confirmado && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: '#158361', margin: '12px 0 0' }}>
                  <strong>✓ Asignado a {asesor}.</strong> El caso pasa a su bandeja.
                </p>
              )}
              {nota && <div role="status"><Mudo style={{ marginTop: 12 }}>{nota}</Mudo></div>}
            </section>

            <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '24px', color: 'var(--text-title)', margin: 0 }}>
                  Expediente recuperado automáticamente
                </h2>
                <Button variant="text" size="sm" onClick={forzarBusqueda}>Forzar nueva búsqueda</Button>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {visibles.map((a, i) => (
                  <li
                    key={a.titulo}
                    style={{
                      display: 'flex', gap: 14, alignItems: 'center', padding: '16px 20px',
                      ...(i < visibles.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>{a.titulo}</span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>{a.fecha}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => excluir(a.titulo)}
                      style={{ flex: 'none', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 12px', minHeight: 36, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-body)' }}
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                <Button variant="text" size="sm" onClick={agregarDocumento}>Agregar documento faltante</Button>
              </div>
            </section>
          </div>

          <aside style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>Carga del equipo</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {CARGA.map((c) => (
                <div key={c.nombre} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)' }}>
                  <span>{c.nombre}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.casos} casos</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
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
