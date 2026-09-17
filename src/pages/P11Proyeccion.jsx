import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, TextField } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { Aviso, BotonLink, Vacio } from '../components/ui.jsx'
import { buscarCaso } from '../mock/datos.js'
import { R } from '../routes.js'

const MARCADOR = '[verificar: cita del acto de constitución]'
const CITA = '\n\nCONSIDERANDO: que la comunidad fue constituida mediante la Resolución 0512 del 4 de mayo de 2003.'

/** El borrador nace de la plantilla del trámite, con un marcador donde falta el dato. */
const borradorInicial = (caso) =>
  `RESOLUCIÓN N.° [por asignar]\n\n` +
  `Por la cual se decide sobre la solicitud ${caso.numero} de ${caso.tipo.toLowerCase()} del ${caso.comunidad}, ${caso.lugar}.\n\n` +
  `La Dirección de Asuntos para Comunidades Negras, Afrocolombianas, Raizales y Palenqueras, en uso de sus facultades legales,\n\n` +
  `CONSIDERANDO: que la comunidad radicó la solicitud el ${caso.radicadoEl} junto con el acta de asamblea, el documento de identidad del nuevo representante y el listado de asistentes.\n\n` +
  `${MARCADOR}\n\n` +
  `RESUELVE: registrar a Arnulfo Hurtado como representante legal del ${caso.comunidad}.`

export default function P11Proyeccion() {
  const { radicado } = useParams()
  const caso = buscarCaso(radicado)

  const [borrador, setBorrador] = useState(() => (caso ? borradorInicial(caso) : ''))
  const [modo, setModo] = useState(null) // null | 'corregir' | 'justificar'
  const [enviado, setEnviado] = useState(false)

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

  const resuelto = modo != null

  const corregir = () => {
    setBorrador((b) => b.replace(MARCADOR, 'Se cita a continuación.') + CITA)
    setModo('corregir')
  }

  const enviar = () => {
    // TODO(backend): enviar la proyección a pre-revisión y consumir el retorno interno del caso.
    setEnviado(true)
  }

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Daniel Perea</strong> · Asesor · Dirección de Asuntos NARP
      </p>

      <Migas items={[{ label: 'Bandeja del asesor', href: R.asesorBandeja }, { label: caso.numero }]} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '12px 0 0' }}>
        Editor de proyección
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 24px', maxWidth: '70ch' }}>
        {caso.numero} · {caso.tipo} · {caso.comunidad}
      </p>

      {enviado && (
        <div style={{ marginBottom: 20 }}>
          <Aviso tono="exito" titulo="Enviado a pre-revisión">
            Este caso ya usó su único retorno interno: si aparece un hallazgo nuevo, pasa directo a la revisora.{' '}
            <BotonLink variant="outline" size="sm" to={R.revisionBandeja}>Ir a la bandeja de revisión</BotonLink>
          </Aviso>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 24, alignItems: 'start' }}>
        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
            El sistema generó este borrador sobre la plantilla del trámite. Lo que cambies aquí queda registrado como edición tuya.
          </p>
          <TextField
            label="Borrador de la resolución"
            multiline
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
          />
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '24px', color: 'var(--text-title)', margin: 0 }}>
              Atención de hallazgos
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '6px 0 14px' }}>
              Recuerda: este caso solo puede volver una vez a esta pantalla.
            </p>
            <div style={{ border: '1px solid var(--border-subtle)', borderLeft: '4px solid #9D7700', borderRadius: 8, background: '#FFFAE8', padding: '14px 16px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
                <strong>Hallazgo:</strong> la proyección no cita el acto administrativo de constitución de la comunidad.
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '8px 0 0' }}>
                Evidencia: Resolución 0512 de 2003, disponible en la pestaña Expediente.
              </p>
              {resuelto ? (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: '#158361', margin: '10px 0 0' }}>
                  <strong>
                    ✓ {modo === 'corregir'
                      ? 'Corregido en el borrador.'
                      : 'Justificado: la referencia se incluirá en el acto final, ya validada por el asesor.'}
                  </strong>
                </p>
              ) : (
                <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                  <Button variant="outline" size="sm" onClick={corregir}>Corregir en el borrador</Button>
                  <Button variant="text" size="sm" onClick={() => setModo('justificar')}>Justificar por escrito</Button>
                </div>
              )}
            </div>
          </section>

          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            {/* No se puede enviar sin atender los hallazgos: el marcador no puede llegar a la revisora. */}
            <Button disabled={!resuelto || enviado} onClick={enviar}>
              {enviado ? 'Enviado a pre-revisión' : 'Enviar a pre-revisión'}
            </Button>
          </section>
        </div>
      </div>
    </Layout>
  )
}
