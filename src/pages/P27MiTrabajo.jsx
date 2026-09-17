import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { Parrafo } from '../components/ui.jsx'
import { R } from '../routes.js'

const PENDIENTES = [
  { valor: '2', etiqueta: 'Actos pendientes de tu firma', href: R.firmaBandeja },
  { valor: '1', etiqueta: 'Pendiente de radicación por falla externa', href: R.pendientesRadicacion },
  { valor: '2', etiqueta: 'Casos en riesgo de vencer esta semana', href: R.tableroGestion },
]

const NOTIFICACIONES = [
  { texto: 'RUPN-2026-004871 fue aprobado por Elena Vargas y pasó a tu bandeja de firma.', cuando: 'Hoy, 8:14 a.m.' },
  { texto: 'RUPN-2026-004690 está a 2 días de vencer su término.', cuando: 'Hoy, 7:00 a.m.' },
  { texto: 'RUPN-2026-005102 volvió de un retorno interno resuelto por Daniel Perea.', cuando: 'Ayer, 4:32 p.m.' },
  { texto: 'Te mencionaron en una nota interna del expediente RUPN-2026-004320.', cuando: 'Ayer, 11:05 a.m.' },
]

export default function P27MiTrabajo() {
  return (
    <Layout backoffice padding="0">
      <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-subtle)' }}>
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)' }}>
            Sesión de <strong>Marta Rincón</strong> · Firmante y Coordinadora · Dirección de Asuntos NARP
          </span>
          <Link to={R.ingresoFuncionario} style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: 14 }}>
            Cambiar de rol
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 24px 64px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
          Mi trabajo hoy
        </h1>
        <Parrafo style={{ margin: '8px 0 0' }}>Un solo punto de entrada, sin importar con cuál de tus roles trabajes.</Parrafo>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginTop: 24 }}>
          {PENDIENTES.map((p) => (
            <Link
              key={p.etiqueta}
              to={p.href}
              style={{ display: 'block', border: '1px solid var(--border-subtle)', borderTop: '4px solid var(--color-cobalt)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, textDecoration: 'none' }}
            >
              <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 32, lineHeight: '38px', color: 'var(--text-title)' }}>{p.valor}</span>
              <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-body)', marginTop: 6 }}>{p.etiqueta}</span>
            </Link>
          ))}
        </div>

        <section style={{ marginTop: 28, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '24px', color: 'var(--text-title)', margin: 0, padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            Notificaciones internas
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {NOTIFICACIONES.map((n, i) => (
              <li
                key={n.texto}
                style={{
                  display: 'flex', gap: 12, padding: '14px 20px',
                  ...(i < NOTIFICACIONES.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                }}
              >
                <span aria-hidden="true" style={{ flex: 'none', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-cobalt)', marginTop: 8 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)' }}>{n.texto}</span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', marginTop: 2 }}>{n.cuando}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  )
}
