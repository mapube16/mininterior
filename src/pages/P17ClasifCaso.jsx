import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Select, TextField } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { Parrafo, Mudo, Vacio } from '../components/ui.jsx'
import { buscarCaso } from '../mock/datos.js'
import { R } from '../routes.js'

// Las dos categorías van EN PARALELO y ninguna viene preseleccionada: el sistema no
// logra distinguirlas y quien clasifica debe elegir a conciencia (regla del handoff).
const OPCIONES = [
  { id: 'censo', titulo: 'Actualización del censo de integrantes', senales: 'el formulario incluye un nuevo conteo de familias y personas.' },
  { id: 'datos', titulo: 'Actualizar los datos de la comunidad', senales: 'el formulario también cambió el correo de contacto de la comunidad.' },
]

const CATEGORIAS = [
  'Cambio de representante legal',
  'Actualizar los datos de la comunidad',
  'Actualización del censo de integrantes',
  'Registro de nueva comunidad',
]

const DATOS_SOLICITUD = [
  { k: 'Nuevo número de familias', v: '134 (antes 128)' },
  { k: 'Correo de contacto actualizado', v: 'guapiabajounidos@correo.com' },
]

const CAJA = { border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 16 }

export default function P17ClasifCaso() {
  const { radicado } = useParams()
  const caso = buscarCaso(radicado)
  const [confirmada, setConfirmada] = useState(null)
  const [categoriaCorregida, setCategoriaCorregida] = useState(null)
  const [motivo, setMotivo] = useState('')

  if (!caso) {
    return (
      <Layout backoffice>
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja de clasificación.{' '}
          <Link to={R.clasificacionBandeja}>Volver a la bandeja</Link>
        </Vacio>
      </Layout>
    )
  }

  const datos = [
    { k: 'Comunidad', v: caso.comunidad },
    { k: 'Fecha de radicación', v: caso.radicadoEl },
    ...DATOS_SOLICITUD,
  ]

  // TODO(backend): confirmar la categoría mueve el caso a la mesa de asignación.
  const confirmar = (titulo) => setConfirmada(titulo)

  const corregirCategoria = (v) => {
    setCategoriaCorregida(v)
    setConfirmada(null)
  }

  return (
    <Layout backoffice padding="0">
      <Sesion>Sesión de <strong>Sandra Molano</strong> · Clasificadora · Dirección de Asuntos NARP</Sesion>
      <div style={{ padding: '24px 24px 64px' }}>
        <Migas items={[{ label: 'Bandeja de clasificación', href: R.clasificacionBandeja }, { label: caso.numero }]} />

        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '12px 0 0' }}>
          Pantalla de clasificación
        </h1>
        <Parrafo style={{ margin: '8px 0 24px', maxWidth: '70ch' }}>
          {caso.numero} · {caso.comunidad} · {caso.lugar}
        </Parrafo>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: '0 0 12px' }}>
              Datos de la solicitud
            </h2>
            <dl style={{ margin: 0 }}>
              {datos.map((d) => (
                <div key={d.k} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <dt style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{d.k}</dt>
                  <dd style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-title)', margin: '4px 0 0' }}>{d.v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <Mudo>El sistema no logra distinguir entre estas dos categorías. Ninguna viene preseleccionada.</Mudo>

            {OPCIONES.map((o) => (
              <section key={o.id} style={CAJA}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', margin: 0 }}>{o.titulo}</h3>
                <Parrafo style={{ fontSize: 14, lineHeight: '22px', margin: '8px 0 0' }}>Señales: {o.senales}</Parrafo>
                <div style={{ marginTop: 12 }}>
                  <Button variant="outline" onClick={() => confirmar(o.titulo)}>Confirmar esta categoría</Button>
                </div>
              </section>
            ))}

            <section style={CAJA}>
              <Select
                label="O corrige a otra categoría"
                placeholder="Elige una categoría"
                options={CATEGORIAS}
                value={categoriaCorregida}
                onChange={corregirCategoria}
              />
              <div style={{ marginTop: 10 }}>
                <TextField label="Motivo de la corrección" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
              </div>
            </section>

            {confirmada && (
              <div style={{ border: '1px solid #158361', borderLeft: '4px solid #158361', borderRadius: 8, background: '#E6F3EE', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
                  Clasificado como <strong>{confirmada}</strong>. El caso pasa a la mesa de asignación.
                </p>
              </div>
            )}

            <Link to={R.clasificacionBandeja} style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>Devolver a triage</Link>
          </div>
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
