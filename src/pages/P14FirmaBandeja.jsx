import { useState } from 'react'
import { Checkbox } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { BotonLink } from '../components/ui.jsx'
import { buscarCaso } from '../mock/datos.js'
import { R, ruta } from '../routes.js'

// Caso propio de la bandeja de firma: no está en CASOS de datos.js (ver reporte del port).
const RIO_NAYA = {
  numero: 'RUPN-2026-004320',
  tipo: 'Cambio de representante legal',
  comunidad: 'Consejo Comunitario del Río Naya',
  lugar: 'Buenaventura, Valle del Cauca',
}

const APROBACIONES = {
  'RUPN-2026-004871': { aprobador: 'Elena Vargas', fecha: '27 de agosto de 2026' },
  'RUPN-2026-004320': { aprobador: 'Elena Vargas', fecha: '26 de agosto de 2026' },
}

const PARA_FIRMA = [buscarCaso('RUPN-2026-004871'), RIO_NAYA]

export default function P14FirmaBandeja() {
  const [seleccion, setSeleccion] = useState(() => PARA_FIRMA.map((c) => c.numero))

  const alternar = (numero) =>
    setSeleccion((s) => (s.includes(numero) ? s.filter((n) => n !== numero) : [...s, numero]))

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Marta Rincón</strong> · Directora de Asuntos NARP · Firmante
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
            Bandeja de firma
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
            Actos aprobados por revisión, pendientes de tu firma electrónica.
          </p>
        </div>
        {/* La firma por lote se confirma documento por documento en la pantalla de firma. */}
        <BotonLink
          variant="outline"
          disabled={seleccion.length === 0}
          to={ruta(R.firmaCaso, { radicado: seleccion[0] ?? PARA_FIRMA[0].numero })}
        >
          Firmar seleccionados ({seleccion.length})
        </BotonLink>
      </div>

      <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {PARA_FIRMA.map((c, i) => (
            <li
              key={c.numero}
              style={{
                display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
                ...(i < PARA_FIRMA.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
              }}
            >
              <span style={{ flex: 'none' }}>
                <Checkbox
                  label={`Seleccionar ${c.numero}`}
                  checked={seleccion.includes(c.numero)}
                  onChange={() => alternar(c.numero)}
                />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-muted)' }}>
                  {c.numero} · aprobado por {APROBACIONES[c.numero].aprobador} el {APROBACIONES[c.numero].fecha}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', marginTop: 2 }}>
                  {c.tipo}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                  {c.comunidad} · {c.lugar}
                </span>
              </div>
              <BotonLink variant="outline" to={ruta(R.firmaCaso, { radicado: c.numero })}>Firmar</BotonLink>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
