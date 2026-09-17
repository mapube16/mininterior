import { useState } from 'react'
import { Button } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { Parrafo } from '../components/ui.jsx'

const INICIALES = [
  {
    numero: 'RUPN-2026-004320',
    tipo: 'Cambio de representante legal',
    comunidad: 'Consejo Comunitario del Río Naya',
    fecha: '27 de agosto de 2026',
    intentos: 2,
    resuelto: false,
    reintentando: false,
  },
]

export default function P26Pendientes() {
  const [casos, setCasos] = useState(INICIALES)

  const cambiar = (numero, cambios) =>
    setCasos((cs) => cs.map((c) => (c.numero === numero ? { ...c, ...cambios } : c)))

  // El reintento es IDEMPOTENTE: la decisión ya está firmada y el radicado es único,
  // así que volver a intentar no genera un segundo acto. Por eso el caso resuelto
  // deja el botón inactivo en vez de desaparecer de la lista.
  // TODO(backend): reintentar la radicación contra el sistema documental con la
  // misma clave de idempotencia del caso.
  const reintentar = (caso) => {
    if (caso.resuelto || caso.reintentando) return
    cambiar(caso.numero, { reintentando: true })
    setTimeout(() => cambiar(caso.numero, { resuelto: true, reintentando: false }), 900)
  }

  return (
    <Layout backoffice padding="0">
      <Sesion>Sesión de <strong>Marta Rincón</strong> · Firmante · Dirección de Asuntos NARP</Sesion>
      <div style={{ padding: '24px 24px 64px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
          Pendientes de radicación
        </h1>
        <Parrafo style={{ margin: '8px 0 0', maxWidth: '70ch' }}>
          La decisión ya está tomada; el radicado no se generó porque el sistema documental del Ministerio no respondió.
          La operación es segura: reintentar no duplica el acto.
        </Parrafo>

        <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {casos.map((c, i) => {
              const color = c.resuelto ? '#158361' : '#9D7700'
              const fondo = c.resuelto ? '#E6F3EE' : '#FFFAE8'
              return (
                <li
                  key={c.numero}
                  style={{
                    display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
                    ...(i < casos.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-muted)' }}>
                      {c.numero} · firmado el {c.fecha} · {c.intentos} intentos
                    </span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', marginTop: 2 }}>
                      {c.tipo}
                    </span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                      {c.comunidad}
                    </span>
                  </div>
                  <span
                    role="status"
                    style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: fondo, color, border: `1px solid ${color}`, borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}
                  >
                    {c.resuelto ? '✓ Radicado' : 'Pendiente de radicación'}
                  </span>
                  <Button variant="outline" disabled={c.resuelto || c.reintentando} onClick={() => reintentar(c)}>
                    {c.resuelto ? 'Radicado' : c.reintentando ? 'Reintentando…' : 'Reintentar'}
                  </Button>
                </li>
              )
            })}
          </ul>
        </section>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: '16px 0 0' }}>
          Ningún caso se pierde por una falla de integración: queda aquí, visible, hasta que el radicado se genere.
          Reintentar es seguro — el acto ya firmado no se duplica.
        </p>
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
