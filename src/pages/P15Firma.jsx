import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Checkbox } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { Aviso, BotonLink, Mudo, Vacio } from '../components/ui.jsx'
import { api } from '../api/cliente.js'
import { useDatos } from '../api/useDatos.js'
import { buscarCaso } from '../mock/datos.js'
import { R } from '../routes.js'

// Caso propio de la bandeja de firma: no está en CASOS de datos.js (ver reporte del port).
const RIO_NAYA = {
  numero: 'RUPN-2026-004320',
  tipo: 'Cambio de representante legal',
  comunidad: 'Consejo Comunitario del Río Naya',
  lugar: 'Buenaventura, Valle del Cauca',
}

// ponytail: el backend no expone un GET del documento final; se muestra la plantilla del
// handoff con los datos reales del caso hasta que exista ese endpoint.
const documento = (caso) =>
  `RESOLUCIÓN${caso.radicadoExterno ? ` N.° ${caso.radicadoExterno}` : ''}\n\n` +
  `Por la cual se decide sobre la solicitud ${caso.numero} de ${(caso.tipo ?? '').toLowerCase()} de ${caso.comunidad ?? '[VERIFICAR: comunidad]'}.\n\n` +
  `CONSIDERANDO: que la comunidad fue constituida mediante la Resolución 0512 del 4 de mayo de 2003.\n\n` +
  `CONSIDERANDO: que la comunidad radicó la solicitud junto con el acta de asamblea, el documento de identidad del nuevo representante y el listado de asistentes.\n\n` +
  `Sentido de la decisión: ${caso.sentido ?? 'favorable'}.\n\n` +
  (caso.fundamento ? `FUNDAMENTO: ${caso.fundamento}\n\n` : '') +
  `RESUELVE: inscribir en el registro la novedad solicitada.`

export default function P15Firma() {
  const { radicado } = useParams()
  const respaldo = buscarCaso(radicado) ?? (radicado === RIO_NAYA.numero ? RIO_NAYA : null)
  const { datos: caso, cargando } = useDatos((a) => a.caso(radicado), respaldo, [radicado])

  const [confirmado, setConfirmado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [firmado, setFirmado] = useState(null)
  const [error, setError] = useState(null)
  const [reintentable, setReintentable] = useState(false)

  if (!caso && !cargando) {
    return (
      <Layout backoffice padding="24px 24px 64px">
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja de firma.{' '}
          <BotonLink variant="outline" to={R.firmaBandeja}>Volver a la bandeja</BotonLink>
        </Vacio>
      </Layout>
    )
  }
  if (!caso) return <Layout backoffice padding="24px 24px 64px"><Mudo>Cargando el caso…</Mudo></Layout>

  const firmar = async () => {
    setEnviando(true)
    setError(null)
    setReintentable(false)
    try {
      const r = await api.firmar(caso.numero)
      setFirmado(r)
    } catch (e) {
      setError(e.mensaje ?? e.message)
      // 503: el sistema documental no respondió. El acto no se pierde ni se duplica.
      setReintentable(e.estado === 503)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Layout backoffice padding="24px 24px 64px">
      <Migas items={[{ label: 'Bandeja de firma', href: R.firmaBandeja }, { label: caso.numero }]} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '12px 0 0' }}>
        Firma
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 24px', maxWidth: '70ch' }}>
        {[caso.numero, caso.tipo, caso.comunidad].filter(Boolean).join(' · ')}
      </p>

      {firmado && (
        <div style={{ marginBottom: 20 }}>
          <Aviso tono="exito" titulo="Firmado">
            {firmado.radicadoExterno ? `Resolución ${firmado.radicadoExterno}, radicada.` : 'El acto quedó firmado y radicado.'}{' '}
            El ciudadano recibirá el aviso por correo y mensaje de texto.
          </Aviso>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 20 }}>
          <Aviso tono={reintentable ? 'aviso' : 'error'} titulo={reintentable ? 'Radicación pendiente' : 'No pudimos firmar'}>
            {error}
            {reintentable && ' Puedes volver a intentarlo: el reintento no duplica el acto.'}
          </Aviso>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 24, alignItems: 'start' }}>
        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, minWidth: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: '0 0 12px' }}>
            Documento final
          </h2>
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 6, background: 'var(--surface-page)', padding: 18, fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '24px', color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>
            {documento(caso)}
          </div>
        </section>

        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, minWidth: 0 }}>
          {/* La firma exige confirmación explícita: sin ella el botón no se activa. */}
          <Checkbox
            label="Confirmo que revisé el documento final."
            checked={confirmado}
            onChange={() => setConfirmado((v) => !v)}
          />
          <div style={{ marginTop: 16 }}>
            <Button disabled={!confirmado || enviando || firmado != null} onClick={firmar}>
              {reintentable ? 'Reintentar la firma' : 'Firmar con firma electrónica'}
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  )
}
