import { useState } from 'react'
import { Button, TextField } from '../ds/index.js'
import { useParams } from 'react-router-dom'
import Layout, { Migas } from '../components/Layout.jsx'
import { Aviso, BotonLink, Vacio } from '../components/ui.jsx'
import { buscarCaso } from '../mock/datos.js'
import { R } from '../routes.js'

// Caso propio de la bandeja de revisión: no está en CASOS de datos.js (ver reporte del port).
const RIO_NAYA = {
  numero: 'RUPN-2026-004320',
  tipo: 'Cambio de representante legal',
  comunidad: 'Consejo Comunitario del Río Naya',
  lugar: 'Buenaventura, Valle del Cauca',
  retornos: 0,
  asesor: 'Daniel Perea',
}

const proyeccion = (caso) =>
  `RESOLUCIÓN N.° 4187\n\n` +
  `Por la cual se decide sobre la solicitud ${caso.numero} de ${caso.tipo.toLowerCase()} del ${caso.comunidad}, ${caso.lugar}.\n\n` +
  `CONSIDERANDO: que la comunidad fue constituida mediante la Resolución 0512 del 4 de mayo de 2003.\n\n` +
  `CONSIDERANDO: que la comunidad radicó la solicitud el 12 de agosto de 2026 junto con el acta de asamblea, el documento de identidad del nuevo representante y el listado de asistentes.\n\n` +
  `RESUELVE: registrar a Arnulfo Hurtado como representante legal del ${caso.comunidad}.`

// Verificaciones superadas, no un veredicto: la pre-revisión nunca dice "aprobado" ni da un porcentaje.
const VERIFICACIONES = [
  'Documentos completos según el tipo de trámite',
  'Fechas coherentes con el registro',
  'Representante propuesto sin conflicto en otra comunidad',
  'Ningún marcador de verificación pendiente en el texto',
]

export default function P13RevisionCaso() {
  const { radicado } = useParams()
  const caso = buscarCaso(radicado) ?? (radicado === RIO_NAYA.numero ? RIO_NAYA : null)

  const [mostrarCambio, setMostrarCambio] = useState(false)
  const [motivoCambio, setMotivoCambio] = useState('')
  const [resultado, setResultado] = useState(null) // null | 'aprobado' | 'devuelto'

  if (!caso) {
    return (
      <Layout backoffice padding="24px 24px 64px">
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja de revisión.{' '}
          <BotonLink variant="outline" to={R.revisionBandeja}>Volver a la bandeja</BotonLink>
        </Vacio>
      </Layout>
    )
  }

  // Un solo retorno interno por caso: si ya se usó, devolver queda deshabilitado con la nota.
  const retornoAgotado = caso.retornos > 0

  const aprobar = () => {
    // TODO(backend): aprobar la proyección y enviarla a la bandeja de firma.
    setResultado('aprobado')
  }

  const devolver = () => {
    // TODO(backend): devolver al asesor con observaciones y consumir el único retorno interno.
    setResultado('devuelto')
  }

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Elena Vargas</strong> · Revisora · Dirección de Asuntos NARP
      </p>

      <Migas items={[{ label: 'Bandeja de revisión', href: R.revisionBandeja }, { label: caso.numero }]} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '12px 0 0' }}>
        Pantalla de revisión
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 24px', maxWidth: '70ch' }}>
        {caso.numero} · {caso.tipo} · {caso.comunidad}
      </p>

      {resultado && (
        <div style={{ marginBottom: 20 }}>
          {resultado === 'aprobado' ? (
            <Aviso tono="exito" titulo="Aprobado">
              El acto pasa a la bandeja de firma.{' '}
              <BotonLink variant="outline" size="sm" to={R.firmaBandeja}>Ir a la bandeja de firma</BotonLink>
            </Aviso>
          ) : (
            <Aviso tono="aviso" titulo="Devuelto al asesor">
              El caso vuelve a {caso.asesor ?? 'el asesor'} con tus observaciones. Este era su único retorno interno.
            </Aviso>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 24, alignItems: 'start' }}>
        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, minWidth: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: '0 0 12px' }}>
            Proyección
          </h2>
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 6, background: 'var(--surface-page)', padding: 18, fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '24px', color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>
            {proyeccion(caso)}
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            {retornoAgotado && (
              <>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
                  Hallazgos corregidos
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '8px 0 0' }}>
                  La proyección no citaba el acto de constitución. {caso.asesor ?? 'El asesor'} corrigió el borrador citando la
                  Resolución 0512 de 2003 en el segundo considerando.
                </p>
              </>
            )}

            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: retornoAgotado ? '20px 0 0' : 0 }}>
              Verificaciones superadas
            </h2>
            <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {VERIFICACIONES.map((v) => (
                <li key={v} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)' }}>
                  <span aria-hidden="true" style={{ color: '#158361', fontWeight: 700 }}>✓</span>
                  {v}
                </li>
              ))}
            </ul>
          </section>

          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: '0 0 14px' }}>
              Decisión
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button disabled={resultado != null} onClick={aprobar}>Aprobar y enviar a firma</Button>
              <Button variant="outline" disabled={retornoAgotado || resultado != null} onClick={devolver}>
                Devolver al asesor con observaciones
              </Button>
              {retornoAgotado && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: 0 }}>
                  Este caso ya tuvo un retorno interno; no puede devolverse otra vez.
                </p>
              )}
              <Button variant="text" onClick={() => setMostrarCambio((v) => !v)}>Cambiar el sentido de la decisión</Button>
            </div>
            {mostrarCambio && (
              <div style={{ marginTop: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                <TextField
                  label="Motivo del cambio de sentido"
                  multiline
                  value={motivoCambio}
                  onChange={(e) => setMotivoCambio(e.target.value)}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  )
}
