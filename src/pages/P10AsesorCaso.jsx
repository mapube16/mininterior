import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, RadioGroup, TextField } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { BotonLink, Vacio } from '../components/ui.jsx'
import { buscarCaso } from '../mock/datos.js'
import { R, ruta } from '../routes.js'

const DATOS_SOLICITUD = [
  { k: 'Fecha de la asamblea', v: '2 de agosto de 2026' },
  { k: 'Nuevo representante legal', v: 'Arnulfo Hurtado' },
  { k: 'Número de identificación', v: '1.084.xxx.xxx' },
  { k: 'Cómo fue la elección', v: 'Asamblea general' },
  { k: 'Representante saliente', v: 'Rosalba Mosquera' },
]

const DOCS = [
  { nombre: 'Acta de la asamblea del 2 de agosto de 2026', meta: 'Foto tomada con celular · 2,1 MB' },
  { nombre: 'Documento de identidad del nuevo representante', meta: 'PDF · 480 KB' },
  { nombre: 'Listado de asistentes a la asamblea', meta: 'PDF · 1,3 MB' },
]

const ANTECEDENTES = [
  { titulo: 'Acto de constitución de la comunidad', fecha: 'Resolución 0512 del 4 de mayo de 2003' },
  { titulo: 'Cambio de representante legal anterior', fecha: 'Resolución 2890 del 11 de junio de 2019' },
  { titulo: 'Actualización de linderos', fecha: 'Resolución 3402 del 20 de febrero de 2023' },
]

const PREGUNTAS = [
  { texto: '¿Cuándo se constituyó la comunidad?', respuesta: 'Se constituyó el 4 de mayo de 2003.', fuente: 'Resolución 0512 de 2003, expediente · Actos previos' },
  { texto: '¿Quién es el representante legal actual?', respuesta: 'Rosalba Mosquera, registrada desde el 11 de junio de 2019.', fuente: 'Resolución 2890 de 2019, expediente · Actos previos' },
]

const PESTANAS = [
  { id: 'solicitud', etiqueta: 'Solicitud' },
  { id: 'documentos', etiqueta: 'Documentos' },
  { id: 'expediente', etiqueta: 'Expediente' },
]

const OPCIONES_SENTIDO = ['Favorable', 'Desfavorable', 'Requiere aclaración']

const CHIP_RECIBIDO = {
  flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E6F3EE', color: '#158361',
  border: '1px solid #158361', borderRadius: 20, padding: '2px 10px',
  fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', whiteSpace: 'nowrap',
}

export default function P10AsesorCaso() {
  const { radicado } = useParams()
  const navegar = useNavigate()
  const caso = buscarCaso(radicado)

  const [tab, setTab] = useState('solicitud')
  const [sentido, setSentido] = useState(null)
  const [fundamento, setFundamento] = useState('')
  const [preguntaIdx, setPreguntaIdx] = useState(null)

  if (!caso) {
    return (
      <Layout backoffice padding="24px 24px 64px">
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja del asesor.{' '}
          <BotonLink variant="outline" to={R.asesorBandeja}>Volver a la bandeja</BotonLink>
        </Vacio>
      </Layout>
    )
  }

  const pregunta = preguntaIdx != null ? PREGUNTAS[preguntaIdx] : null
  // "El sistema llena, no decide": sin sentido Y fundamento no hay borrador que proyectar.
  const faltaDecision = !sentido || !fundamento

  const registrar = () => {
    // TODO(backend): guardar el sentido y el fundamento del asesor antes de generar la proyección.
    navegar(ruta(R.asesorProyeccion, { radicado: caso.numero }))
  }

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Daniel Perea</strong> · Asesor · Dirección de Asuntos NARP
      </p>

      <Migas items={[{ label: 'Bandeja del asesor', href: R.asesorBandeja }, { label: caso.numero }]} />

      <div style={{ marginTop: 12 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: 0 }}>
          Solicitud {caso.numero}
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '6px 0 0', maxWidth: '34ch' }}>
          {caso.tipo}
        </h1>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, lineHeight: '28px', color: 'var(--text-body)', margin: '8px 0 0' }}>
          {caso.comunidad} · {caso.lugar}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 24, marginTop: 24, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === tab}
                onClick={() => setTab(p.id)}
                style={{
                  minHeight: 36, padding: '0 16px', borderRadius: 20, fontFamily: 'var(--font-body)', fontSize: 14, cursor: 'pointer',
                  ...(p.id === tab
                    ? { border: '1px solid var(--color-cobalt)', background: 'var(--color-cobalt)', color: '#fff' }
                    : { border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', color: 'var(--text-body)' }),
                }}
              >
                {p.etiqueta}
              </button>
            ))}
          </div>

          {tab === 'solicitud' && (
            <section style={{ marginTop: 16, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 0 }}>
              <dl style={{ margin: 0, padding: '8px 20px' }}>
                {DATOS_SOLICITUD.map((d) => (
                  <div key={d.k} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <dt style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {d.k}
                    </dt>
                    <dd style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-title)', margin: '4px 0 0' }}>
                      {d.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {tab === 'documentos' && (
            <section style={{ marginTop: 16, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {DOCS.map((d, i) => (
                  <li
                    key={d.nombre}
                    style={{
                      display: 'flex', gap: 14, alignItems: 'center', padding: '16px 20px',
                      ...(i < DOCS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                    }}
                  >
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-title)' }}>{d.nombre}</span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)' }}>{d.meta}</span>
                    </span>
                    <span style={CHIP_RECIBIDO}>
                      <span aria-hidden="true" style={{ fontWeight: 700 }}>✓</span>Recibido
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tab === 'expediente' && (
            <section style={{ marginTop: 16, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {ANTECEDENTES.map((a, i) => (
                  <li
                    key={a.titulo}
                    style={{ padding: '14px 20px', ...(i < ANTECEDENTES.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null) }}
                  >
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>{a.titulo}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>{a.fecha}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '26px', color: 'var(--text-title)', margin: 0 }}>
              Registro de la decisión
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '6px 0 16px' }}>
              Registra el sentido antes de generar cualquier borrador.
            </p>
            <RadioGroup legend="Sentido de la decisión" options={OPCIONES_SENTIDO} value={sentido} onChange={setSentido} />
            <div style={{ marginTop: 14 }}>
              <TextField
                label="Fundamento"
                multiline
                placeholder="Por qué procede este sentido"
                value={fundamento}
                onChange={(e) => setFundamento(e.target.value)}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <Button disabled={faltaDecision} onClick={registrar}>
                Registrar decisión y continuar a la proyección
              </Button>
            </div>
          </section>
        </div>

        <aside style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, minWidth: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
            Asistente de consulta
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: '6px 0 14px' }}>
            Responde con cita a la fuente exacta del expediente.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PREGUNTAS.map((p, i) => (
              <button
                key={p.texto}
                type="button"
                onClick={() => setPreguntaIdx(i)}
                style={{ textAlign: 'left', minHeight: 44, border: '1px dashed var(--border-subtle)', background: 'var(--surface-page)', borderRadius: 6, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-link)', cursor: 'pointer' }}
              >
                {p.texto}
              </button>
            ))}
          </div>
          {pregunta && (
            <div style={{ marginTop: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-body)', margin: 0 }}>{pregunta.respuesta}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: '8px 0 0' }}>Fuente: {pregunta.fuente}</p>
            </div>
          )}
        </aside>
      </div>
    </Layout>
  )
}
