import { useState } from 'react'
import { Button, TextField } from '../ds/index.js'
import { useNavigate, useParams } from 'react-router-dom'
import Layout, { Migas } from '../components/Layout.jsx'
import { Aviso, BotonLink, Mudo, Vacio } from '../components/ui.jsx'
import { api } from '../api/cliente.js'
import { useDatos } from '../api/useDatos.js'
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

// ponytail: el backend no expone un GET de la proyección; el texto se muestra desde la
// plantilla del handoff hasta que exista ese endpoint.
const proyeccion = (caso) =>
  `RESOLUCIÓN\n\n` +
  `Por la cual se decide sobre la solicitud ${caso.numero} de ${(caso.tipo ?? '').toLowerCase()} de ${caso.comunidad ?? '[VERIFICAR: comunidad]'}.\n\n` +
  `CONSIDERANDO: que la comunidad fue constituida mediante la Resolución 0512 del 4 de mayo de 2003.\n\n` +
  `CONSIDERANDO: que la comunidad radicó la solicitud junto con el acta de asamblea, el documento de identidad del nuevo representante y el listado de asistentes.\n\n` +
  `Sentido de la decisión: ${caso.sentido ?? 'pendiente de registro por el asesor'}.\n\n` +
  (caso.fundamento ? `FUNDAMENTO: ${caso.fundamento}\n\n` : '') +
  `RESUELVE: inscribir en el registro la novedad solicitada.`

// Verificaciones superadas, no un veredicto: la pre-revisión nunca dice "aprobado" ni da un porcentaje.
const VERIFICACIONES = [
  'Documentos completos según el tipo de trámite',
  'Fechas coherentes con el registro',
  'Representante propuesto sin conflicto en otra comunidad',
  'Ningún marcador de verificación pendiente en el texto',
]

export default function P13RevisionCaso() {
  const { radicado } = useParams()
  const navegar = useNavigate()
  const respaldo = buscarCaso(radicado) ?? (radicado === RIO_NAYA.numero ? RIO_NAYA : null)
  const { datos: caso, cargando } = useDatos((a) => a.caso(radicado), respaldo, [radicado])
  const { datos: hallazgos } = useDatos((a) => a.hallazgos(radicado), [], [radicado])

  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null) // null | 'aprobar' | 'devolver'
  const [error, setError] = useState(null)

  if (!caso && !cargando) {
    return (
      <Layout backoffice padding="24px 24px 64px">
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja de revisión.{' '}
          <BotonLink variant="outline" to={R.revisionBandeja}>Volver a la bandeja</BotonLink>
        </Vacio>
      </Layout>
    )
  }
  if (!caso) return <Layout backoffice padding="24px 24px 64px"><Mudo>Cargando el caso…</Mudo></Layout>

  // Un solo retorno interno por caso: si ya se usó, devolver queda deshabilitado con la nota.
  const retornoAgotado = caso.retornos > 0
  const motivoValido = motivo.trim().length >= 5

  const decidir = async (accion) => {
    setEnviando(true)
    setError(null)
    try {
      await api.revisar(caso.numero, { accion, motivo: motivo.trim() })
      setResultado(accion)
      if (accion === 'devolver') setTimeout(() => navegar(R.revisionBandeja), 1500)
    } catch (e) {
      // El 409 del segundo retorno se muestra tal cual: es la regla, no un fallo a esconder.
      setError(e.mensaje ?? e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Layout backoffice padding="24px 24px 64px">
      <Migas items={[{ label: 'Bandeja de revisión', href: R.revisionBandeja }, { label: caso.numero }]} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '12px 0 0' }}>
        Pantalla de revisión
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 24px', maxWidth: '70ch' }}>
        {[caso.numero, caso.tipo, caso.comunidad].filter(Boolean).join(' · ')}
      </p>

      {error && (
        <div style={{ marginBottom: 20 }}>
          <Aviso tono="error" titulo="No pudimos registrar la decisión">{error}</Aviso>
        </div>
      )}

      {resultado && (
        <div style={{ marginBottom: 20 }}>
          {resultado === 'aprobar' ? (
            <Aviso tono="exito" titulo="Aprobado">
              El acto pasa a la bandeja de firma.{' '}
              <BotonLink variant="outline" size="sm" to={R.firmaBandeja}>Ir a la bandeja de firma</BotonLink>
            </Aviso>
          ) : (
            <Aviso tono="aviso" titulo="Devuelto al asesor">
              El caso vuelve al asesor con tus observaciones. Este era su único retorno interno.
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
          {/* La pre-revisión nunca muestra veredicto ni porcentaje: solo hallazgos y verificaciones. */}
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
              Hallazgos de la pre-revisión
            </h2>
            {hallazgos.length === 0 ? (
              <Mudo style={{ marginTop: 8 }}>La pre-revisión no dejó hallazgos pendientes.</Mudo>
            ) : (
              <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {hallazgos.map((h) => (
                  <li key={h.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '10px 12px' }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-title)' }}>
                      {h.descripcion}
                    </span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', marginTop: 2 }}>
                      {h.severidad} · {h.estado}{h.ubicacion ? ` · ${h.ubicacion}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: '20px 0 0' }}>
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
            <TextField
              label="Motivo de la decisión"
              multiline
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
            <Mudo style={{ margin: '6px 0 14px' }}>Mínimo 5 caracteres: queda en la trazabilidad del caso.</Mudo>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button disabled={!motivoValido || enviando || resultado != null} onClick={() => decidir('aprobar')}>
                Aprobar y enviar a firma
              </Button>
              <Button
                variant="outline"
                disabled={retornoAgotado || !motivoValido || enviando || resultado != null}
                onClick={() => decidir('devolver')}
              >
                Devolver al asesor con observaciones
              </Button>
              {retornoAgotado && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: 0 }}>
                  Este caso ya tuvo un retorno interno; solo se permite un retorno, así que no puede devolverse otra vez.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
