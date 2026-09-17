import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Checkbox } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { BotonLink, Vacio } from '../components/ui.jsx'
import { buscarCaso } from '../mock/datos.js'
import { R } from '../routes.js'

// Otros actos del mismo lote: no están en CASOS de datos.js (ver reporte del port).
const LOTE = [
  { numero: 'RUPN-2026-004320', comunidad: 'Consejo Comunitario del Río Naya' },
]

const documento = (caso) =>
  `RESOLUCIÓN N.° 4187 DEL 27 DE AGOSTO DE 2026\n\n` +
  `Por la cual se decide sobre la solicitud ${caso.numero} de ${caso.tipo.toLowerCase()} del ${caso.comunidad}, ${caso.lugar}.\n\n` +
  `CONSIDERANDO: que la comunidad fue constituida mediante la Resolución 0512 del 4 de mayo de 2003.\n\n` +
  `CONSIDERANDO: que la comunidad radicó la solicitud el 12 de agosto de 2026 junto con el acta de asamblea, el documento de identidad del nuevo representante y el listado de asistentes.\n\n` +
  `RESUELVE: registrar a Arnulfo Hurtado como representante legal del ${caso.comunidad}.`

export default function P15Firma() {
  const { radicado } = useParams()
  const caso = buscarCaso(radicado)

  const [confirmado, setConfirmado] = useState(false)
  const [firmado, setFirmado] = useState(false)
  const [confirmadosLote, setConfirmadosLote] = useState([])
  const [loteFirmado, setLoteFirmado] = useState(false)

  if (!caso) {
    return (
      <Layout backoffice padding="24px 24px 64px">
        <Vacio titulo="No encontramos ese caso">
          El radicado {radicado} no está en la bandeja de firma.{' '}
          <BotonLink variant="outline" to={R.firmaBandeja}>Volver a la bandeja</BotonLink>
        </Vacio>
      </Layout>
    )
  }

  const firmar = () => {
    // TODO(backend): firmar electrónicamente el acto y radicar la resolución.
    setFirmado(true)
  }

  const confirmarDelLote = (numero) => setConfirmadosLote((s) => (s.includes(numero) ? s : [...s, numero]))

  const firmarLote = () => {
    // TODO(backend): firmar en lote los actos ya confirmados uno a uno.
    setLoteFirmado(true)
  }

  // La firma por lote exige confirmación individual de cada documento antes de habilitarse.
  const faltanConfirmaciones = confirmadosLote.length < LOTE.length

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Marta Rincón</strong> · Directora de Asuntos NARP · Firmante
      </p>

      <Migas items={[{ label: 'Bandeja de firma', href: R.firmaBandeja }, { label: caso.numero }]} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '12px 0 0' }}>
        Firma
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 24px', maxWidth: '70ch' }}>
        {caso.numero} · {caso.tipo} · {caso.comunidad}
      </p>

      {firmado && (
        <div style={{ border: '1px solid #158361', borderLeft: '4px solid #158361', borderRadius: 8, background: '#E6F3EE', padding: '16px 20px', marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
            <strong>✓ Firmado.</strong> Resolución 4187 del 27 de agosto de 2026, radicada. El ciudadano recibirá el aviso por
            correo y mensaje de texto.
          </p>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            {/* La firma exige confirmación explícita: sin ella el botón no se activa. */}
            <Checkbox
              label="Confirmo que revisé el documento final."
              checked={confirmado}
              onChange={() => setConfirmado((v) => !v)}
            />
            <div style={{ marginTop: 16 }}>
              <Button disabled={!confirmado || firmado} onClick={firmar}>Firmar con firma electrónica</Button>
            </div>
          </section>

          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
              Firma por lote
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: '6px 0 14px' }}>
              {LOTE.length === 1 ? 'Otro acto en este lote; se confirma individualmente.' : 'Otros actos en este lote; cada uno se confirma individualmente.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LOTE.map((l) => {
                const listo = confirmadosLote.includes(l.numero)
                return (
                  <div
                    key={l.numero}
                    style={{ border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-title)' }}>{l.numero}</span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)' }}>{l.comunidad}</span>
                    </div>
                    <Button variant="outline" size="sm" disabled={listo || loteFirmado} onClick={() => confirmarDelLote(l.numero)}>
                      {listo ? 'Confirmado' : 'Confirmar'}
                    </Button>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 14 }}>
              <Button disabled={faltanConfirmaciones || loteFirmado} onClick={firmarLote}>
                {loteFirmado ? 'Lote firmado' : `Firmar el lote (${LOTE.length})`}
              </Button>
            </div>
            {faltanConfirmaciones && !loteFirmado && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: '10px 0 0' }}>
                Confirma cada documento del lote para poder firmarlos juntos.
              </p>
            )}
          </section>
        </div>
      </div>
    </Layout>
  )
}
