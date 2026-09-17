import { Link } from 'react-router-dom'
import { Button } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import { BotonLink } from '../components/ui.jsx'
import { SOLICITUDES, ESTADOS } from '../mock/datos.js'
import { R, ruta } from '../routes.js'

// La cuenta de la maqueta: comunidad vinculada y canales de aviso.
const CUENTA = {
  comunidad: 'Consejo Comunitario Guapi Abajo Unidos · Guapi, Cauca',
  correo: 'rosalba.m@correo.com',
  celular: '320 000 00 00',
}

export default function P5Solicitudes() {
  const urgente = SOLICITUDES.find((s) => s.estado === 'Requiere tu acción')

  return (
    <Layout ancho={1160} padding="24px 24px 64px">
      <Migas items={[{ label: 'Inicio', href: R.inicio }, { label: 'Mis solicitudes' }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
            Mis solicitudes
          </h1>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, lineHeight: '28px', color: 'var(--text-body)', margin: '6px 0 0' }}>
            {CUENTA.comunidad}
          </p>
        </div>
        <BotonLink to={R.tramiteTipo} variant="filled">Nueva solicitud</BotonLink>
      </div>

      {urgente && (
        <section
          style={{
            marginTop: 24, border: '1px solid var(--border-subtle)', borderLeft: '4px solid #A80521', borderRadius: 8,
            background: '#FBE9EC', padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flex: 'none', width: 36, height: 36, borderRadius: '50%', background: '#A80521', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16,
            }}
          >
            !
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', margin: 0 }}>
              Tienes 1 solicitud que requiere tu acción
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '6px 0 0' }}>
              El cambio de representante legal ({urgente.numero}) necesita el acta corregida antes del 5 de septiembre de 2026.
            </p>
          </div>
          <div style={{ marginLeft: 'auto', flex: 'none' }}>
            <BotonLink to={ruta(R.solicitud, { radicado: urgente.numero })} variant="outline">Ver qué falta</BotonLink>
          </div>
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 24, marginTop: 24, alignItems: 'start' }}>
        <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', minWidth: 0 }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '26px', color: 'var(--text-title)', margin: 0 }}>
              Todas las solicitudes
            </h2>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)' }}>
              {SOLICITUDES.length} solicitudes
            </span>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {SOLICITUDES.map((s, i) => {
              const e = ESTADOS[s.estado] ?? ESTADOS['Pendiente']
              return (
                <li
                  key={s.numero}
                  style={{
                    display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
                    ...(i < SOLICITUDES.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-muted)' }}>
                      {s.numero}
                    </span>
                    <Link
                      to={ruta(R.solicitud, { radicado: s.numero })}
                      style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)', marginTop: 2, textWrap: 'pretty' }}
                    >
                      {s.tipo}
                    </Link>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                      {s.meta}
                    </span>
                  </div>
                  <span
                    style={{
                      flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: e.fondo, color: e.color,
                      border: `1px solid ${e.color}`, borderRadius: 20, padding: '4px 12px',
                      fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap',
                    }}
                  >
                    <span aria-hidden="true" style={{ fontWeight: 700 }}>{e.glifo}</span>
                    {s.estado}
                  </span>
                  <span aria-hidden="true" style={{ flex: 'none', color: 'var(--text-muted)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-info)', padding: 20 }}>
            <h2 style={tituloLateral}>Te avisamos cuando algo cambie</h2>
            <p style={textoLateral}>
              Al correo <strong>{CUENTA.correo}</strong> y por mensaje de texto al <strong>{CUENTA.celular}</strong>, cada
              vez que una solicitud cambie de estado o necesites hacer algo.
            </p>
            <div style={{ marginTop: 12 }}>
              {/* TODO(backend): abrir la pantalla de canales de notificación. */}
              <Button variant="text" href="#">Cambiar dónde te avisamos</Button>
            </div>
          </section>

          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
            <h2 style={tituloLateral}>¿Necesitas ayuda?</h2>
            <p style={textoLateral}>
              Llama gratis al <strong>01 8000 000 000</strong>, de lunes a viernes de 8:00 a.m. a 5:00 p.m.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  )
}

const tituloLateral = { fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }
const textoLateral = { fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0' }
