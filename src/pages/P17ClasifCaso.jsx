import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Select, TextField } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { Aviso, Parrafo, Mudo, Vacio } from '../components/ui.jsx'
import { api } from '../api/cliente.js'
import { useDatos } from '../api/useDatos.js'
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

const CAJA = { border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 16 }

const fecha = (v) =>
  v && !Number.isNaN(Date.parse(v))
    ? new Date(v).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : v

// Las claves de `datos` llegan en snake_case desde el backend; aquí se leen como texto.
const etiqueta = (k) => k.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())

export default function P17ClasifCaso() {
  const { radicado } = useParams()
  const navegar = useNavigate()
  const { datos: caso, cargando } = useDatos((api) => api.caso(radicado), buscarCaso(radicado), [radicado])

  const [categoriaCorregida, setCategoriaCorregida] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [confirmada, setConfirmada] = useState(null)
  const [error, setError] = useState(null)

  if (!caso && !cargando) {
    return (
      <Layout backoffice>
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja de clasificación.{' '}
          <Link to={R.clasificacionBandeja}>Volver a la bandeja</Link>
        </Vacio>
      </Layout>
    )
  }
  if (!caso) return <Layout backoffice><Mudo>Cargando el caso…</Mudo></Layout>

  const datos = [
    { k: 'Comunidad', v: caso.comunidad ?? 'Sin comunidad asociada en el registro' },
    { k: 'Fecha de radicación', v: fecha(caso.radicadoEl) ?? 'Sin registrar' },
    ...Object.entries(caso.datos ?? {}).map(([k, v]) => ({ k: etiqueta(k), v: String(v) })),
  ]

  // Clasificar mueve el caso a la mesa de asignación (o lo traslada si no es competencia).
  const clasificar = async (categoria, corregida) => {
    setEnviando(true)
    setError(null)
    try {
      await api.clasificar(caso.numero, { categoria, tipologia: categoria, corregida, motivo: motivo || null })
      setConfirmada(categoria)
      // Ya no está en esta bandeja: se vuelve a ella pasado un momento de confirmación.
      setTimeout(() => navegar(R.clasificacionBandeja), 1200)
    } catch (e) {
      setError(e.mensaje ?? e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Layout backoffice padding="24px 24px 64px">
      <Migas items={[{ label: 'Bandeja de clasificación', href: R.clasificacionBandeja }, { label: caso.numero }]} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '12px 0 0' }}>
        Pantalla de clasificación
      </h1>
      <Parrafo style={{ margin: '8px 0 24px', maxWidth: '70ch' }}>
        {[caso.numero, caso.comunidad].filter(Boolean).join(' · ')}
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
                <Button variant="outline" disabled={enviando || confirmada != null} onClick={() => clasificar(o.titulo, false)}>
                  Confirmar esta categoría
                </Button>
              </div>
            </section>
          ))}

          <section style={CAJA}>
            <Select
              label="O corrige a otra categoría"
              placeholder="Elige una categoría"
              options={CATEGORIAS}
              value={categoriaCorregida}
              onChange={setCategoriaCorregida}
            />
            <div style={{ marginTop: 10 }}>
              <TextField label="Motivo de la corrección" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
            <div style={{ marginTop: 12 }}>
              <Button
                variant="outline"
                disabled={!categoriaCorregida || enviando || confirmada != null}
                onClick={() => clasificar(categoriaCorregida, true)}
              >
                Clasificar con la categoría corregida
              </Button>
            </div>
          </section>

          {error && <Aviso tono="error" titulo="No pudimos clasificar el caso">{error}</Aviso>}

          {confirmada && (
            <Aviso tono="exito" titulo="Clasificado">
              Clasificado como <strong>{confirmada}</strong>. El caso pasa a la mesa de asignación.
            </Aviso>
          )}

          <Link to={R.clasificacionBandeja} style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>Volver a la bandeja</Link>
        </div>
      </div>
    </Layout>
  )
}
