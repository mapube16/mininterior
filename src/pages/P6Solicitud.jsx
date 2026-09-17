import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ProgressSteps } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { Vacio, BotonLink } from '../components/ui.jsx'
import { buscarSolicitud } from '../mock/datos.js'
import { R } from '../routes.js'

const ETAPAS = ['Radicada', 'Revisión de documentos', 'Verificación en territorio', 'Decisión', 'Resolución firmada']

const VARIANTES = {
  revision: {
    etiqueta: 'En revisión', titular: 'En revisión de documentos', etapa: 1, glifo: '↻',
    color: '#9D7700', fondo: '#FFFAE8',
    tituloAviso: 'Estamos revisando tus documentos',
    textoAviso: 'Un profesional de la Dirección está verificando el acta de asamblea y el documento de identidad del nuevo representante. No tienes que hacer nada por ahora.',
    plazoAviso: 'Respuesta estimada: 28 de agosto de 2026 (quedan 9 días hábiles).',
    accion: null,
  },
  accion: {
    etiqueta: 'Requiere acción', titular: 'Requiere acción tuya', etapa: 1, glifo: '!',
    color: '#A80521', fondo: '#FBE9EC',
    tituloAviso: 'Falta un documento para poder continuar',
    textoAviso: 'El acta de asamblea llegó sin la firma del secretario. Vuelve a subirla firmada; el resto de la solicitud queda como está y no pierdes lo radicado.',
    plazoAviso: 'Tienes hasta el 5 de septiembre de 2026 para responder.',
    accion: 'Subir el acta corregida',
  },
  aprobada: {
    etiqueta: 'Aprobada', titular: 'Aprobada', etapa: 4, glifo: '✓',
    color: '#158361', fondo: '#E6F3EE',
    tituloAviso: 'Tu solicitud quedó aprobada',
    textoAviso: 'El cambio de representante legal ya está en el registro público y la resolución quedó firmada. Puedes descargarla o pedirla impresa en un punto de atención.',
    plazoAviso: 'Resolución 4187 del 27 de agosto de 2026.',
    accion: 'Descargar la resolución',
  },
}

const HISTORIAL_BASE = [
  { titulo: 'Radicaste la solicitud', fecha: '12 de agosto de 2026, 10:24 a.m.', detalle: 'Recibimos la solicitud con tres documentos. Te enviamos el número de radicado por correo y por mensaje de texto.' },
  { titulo: 'Revisión de completitud', fecha: '13 de agosto de 2026', detalle: 'Confirmamos que la solicitud tiene los documentos mínimos para entrar a estudio.' },
]

const HISTORIAL_EXTRA = {
  revision: [
    { titulo: 'En revisión de documentos', fecha: '17 de agosto de 2026', detalle: 'Asignada a la profesional a cargo del Cauca. Es la etapa en la que está hoy tu solicitud.', vivo: true },
  ],
  accion: [
    { titulo: 'Revisión de documentos', fecha: '17 de agosto de 2026', detalle: 'Encontramos que el acta de asamblea no tiene la firma del secretario.' },
    { titulo: 'Te pedimos corregir un documento', fecha: '19 de agosto de 2026', detalle: 'Te avisamos por correo y por mensaje de texto. La solicitud queda en espera hasta que subas el acta firmada.', vivo: true },
  ],
  aprobada: [
    { titulo: 'Verificación en territorio', fecha: '20 de agosto de 2026', detalle: 'La alcaldía de Guapi confirmó la realización de la asamblea.' },
    { titulo: 'Decisión favorable', fecha: '25 de agosto de 2026', detalle: 'La Dirección aprobó el cambio de representante legal.' },
    { titulo: 'Resolución firmada y registro actualizado', fecha: '27 de agosto de 2026', detalle: 'La comunidad aparece en el registro público con el nuevo representante.', vivo: true },
  ],
}

const COMUNIDAD = 'Consejo Comunitario Guapi Abajo Unidos'
const CUENTA = { correo: 'rosalba.m@correo.com', celular: '320 000 00 00', representante: 'Rosalba Mosquera' }

const chip = (color, fondo) => ({
  flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: fondo, color,
  border: `1px solid ${color}`, borderRadius: 20, padding: '2px 10px',
  fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', whiteSpace: 'nowrap',
})

export default function P6Solicitud() {
  const { radicado } = useParams()
  const solicitud = buscarSolicitud(radicado)
  const inicial = VARIANTES[solicitud?.etapa] ? solicitud.etapa : 'revision'
  const [clave, setClave] = useState(inicial)

  if (!solicitud) {
    return (
      <Layout ancho={1160}>
        <Vacio titulo="No encontramos esa solicitud">
          Revisa el número de radicado o vuelve a <BotonLink to={R.solicitudes} variant="text">tus solicitudes</BotonLink>.
        </Vacio>
      </Layout>
    )
  }

  const v = VARIANTES[clave]
  const historial = [...HISTORIAL_BASE, ...HISTORIAL_EXTRA[clave]]

  const documentos = [
    { nombre: 'Acta de la asamblea del 2 de agosto de 2026', meta: 'Foto tomada con celular · 2,1 MB', estado: clave === 'accion' ? 'Debes corregirla' : 'Recibido', ok: clave !== 'accion' },
    { nombre: 'Documento de identidad del nuevo representante', meta: 'PDF · 480 KB', estado: 'Recibido', ok: true },
    { nombre: 'Listado de asistentes a la asamblea', meta: 'PDF · 1,3 MB', estado: 'Recibido', ok: true },
  ]

  const datos = [
    { k: 'Número de la solicitud', v: solicitud.numero },
    { k: 'Tipo de trámite', v: solicitud.tipo },
    { k: 'Comunidad', v: COMUNIDAD },
    { k: 'Fecha de radicación', v: '12 de agosto de 2026' },
    { k: 'Dependencia a cargo', v: 'Dirección de Asuntos NARP' },
  ]

  return (
    <Layout ancho={1160} padding="0">
      {/* Conmutador de maqueta: franja a ancho completo, como en el prototipo (antes del <main>). */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-subtle)', margin: '0 -24px' }}>
        <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Maqueta · ver la solicitud en cada estado
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(VARIANTES).map(([k, val]) => {
              const activo = k === clave
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setClave(k)}
                  aria-pressed={activo}
                  style={{
                    minHeight: 36, padding: '0 14px', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 14, cursor: 'pointer',
                    border: `1px solid ${activo ? 'var(--color-cobalt)' : 'var(--border-subtle)'}`,
                    background: activo ? 'var(--color-cobalt)' : 'var(--surface-card)',
                    color: activo ? '#fff' : 'var(--text-body)',
                  }}
                >
                  {val.etiqueta}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 24px 64px' }}>
        <Migas items={[{ label: 'Inicio', href: R.inicio }, { label: 'Mis solicitudes', href: R.solicitudes }, { label: solicitud.numero }]} />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: 0 }}>
              Solicitud {solicitud.numero}
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '6px 0 0', maxWidth: '30ch', textWrap: 'pretty' }}>
              {solicitud.tipo}
            </h1>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, lineHeight: '28px', color: 'var(--text-body)', margin: '8px 0 0' }}>
              {COMUNIDAD} · Guapi, Cauca
            </p>
          </div>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, background: v.fondo, color: v.color,
              border: `1px solid ${v.color}`, borderRadius: 24, padding: '6px 16px',
              fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', whiteSpace: 'nowrap',
            }}
          >
            <span aria-hidden="true" style={{ fontWeight: 700, fontSize: 16 }}>{v.glifo}</span>
            {v.titular}
          </span>
        </div>

        <section style={{ marginTop: 28, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '26px', color: 'var(--text-title)', margin: '0 0 4px' }}>
            En qué va tu solicitud
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Etapa {v.etapa + 1} de 5 · {ETAPAS[v.etapa]}
          </p>
          <ProgressSteps steps={ETAPAS} current={v.etapa} />
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 24, marginTop: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            <section
              style={{
                border: '1px solid var(--border-subtle)', borderLeft: `4px solid ${v.color}`, borderRadius: 8,
                background: v.fondo, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: 'none', width: 40, height: 40, borderRadius: '50%', background: v.color, color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {v.glifo}
              </span>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, lineHeight: '30px', color: 'var(--text-title)', margin: 0 }}>
                  {v.tituloAviso}
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '62ch', textWrap: 'pretty' }}>
                  {v.textoAviso}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-title)', margin: '12px 0 0' }}>
                  <strong>{v.plazoAviso}</strong>
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                  {/* TODO(backend): la acción principal depende del estado real (subir documento o descargar resolución). */}
                  {v.accion && <BotonLink to={R.tramiteTipo} variant="filled">{v.accion}</BotonLink>}
                  <Button variant="outline" href="#ayuda">Necesito ayuda</Button>
                </div>
              </div>
            </section>

            <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
              <h2 style={tituloSeccion}>Qué ha pasado con la solicitud</h2>
              <ol style={{ listStyle: 'none', margin: 0, padding: 20 }}>
                {historial.map((h, i) => (
                  <li key={h.titulo} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 16 }}>
                    <span aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span
                        style={{
                          width: 14, height: 14, borderRadius: '50%',
                          background: h.vivo ? v.color : 'var(--color-cobalt)',
                          boxShadow: h.vivo ? `0 0 0 4px ${v.fondo}` : '0 0 0 0 transparent',
                        }}
                      />
                      <span style={i === historial.length - 1 ? { display: 'none' } : { flex: 1, width: 2, background: 'var(--border-subtle)', minHeight: 24 }} />
                    </span>
                    <span style={{ display: 'block', paddingBottom: 20 }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>
                        {h.titulo}
                      </span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>
                        {h.fecha}
                      </span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', marginTop: 6, maxWidth: '60ch' }}>
                        {h.detalle}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
              <h2 style={tituloSeccion}>Documentos que entregaste</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {documentos.map((d, i) => (
                  <li
                    key={d.nombre}
                    style={{
                      display: 'flex', gap: 14, alignItems: 'center', padding: '16px 20px',
                      ...(i < documentos.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                    }}
                  >
                    <span aria-hidden="true" style={{ flex: 'none', color: 'var(--text-muted)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h8l4 4v14H6z" />
                        <path d="M14 3v4h4" />
                      </svg>
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-title)' }}>{d.nombre}</span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)' }}>{d.meta}</span>
                    </span>
                    <span style={d.ok ? chip('#158361', '#E6F3EE') : chip('#A80521', '#FBE9EC')}>
                      <span aria-hidden="true" style={{ fontWeight: 700 }}>{d.ok ? '✓' : '!'}</span>
                      {d.estado}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
              <h2 style={{ ...tituloSeccion, fontSize: 16, lineHeight: '22px', padding: '16px 18px' }}>Datos de la solicitud</h2>
              <dl style={{ margin: 0, padding: '6px 18px 18px' }}>
                {datos.map((d) => (
                  <div key={d.k} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <dt style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {d.k}
                    </dt>
                    <dd style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-title)', margin: '4px 0 0' }}>{d.v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-info)', padding: 20 }}>
              <h2 style={tituloLateral}>Te avisamos cuando cambie</h2>
              <p style={textoLateral}>
                Al correo <strong>{CUENTA.correo}</strong> y por mensaje de texto al <strong>{CUENTA.celular}</strong>. No
                tienes que volver a entrar a revisar.
              </p>
              <div style={{ marginTop: 12 }}>
                {/* TODO(backend): abrir la pantalla de canales de notificación. */}
                <Button variant="text" href="#">Cambiar dónde te avisamos</Button>
              </div>
            </section>

            <section id="ayuda" style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
              <h2 style={tituloLateral}>¿Necesitas ayuda?</h2>
              <p style={textoLateral}>
                Llama gratis al <strong>01 8000 000 000</strong>, de lunes a viernes de 8:00 a.m. a 5:00 p.m., y ten a mano
                el número de la solicitud.
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '10px 0 0' }}>
                Radicada por {CUENTA.representante}, representante legal registrada.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const tituloSeccion = {
  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '26px',
  color: 'var(--text-title)', margin: 0, padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)',
}
const tituloLateral = { fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }
const textoLateral = { fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0' }
