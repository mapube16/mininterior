import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { R } from '../routes.js'

const SISTEMAS = [
  { nombre: 'Sistema documental del Ministerio', detalle: '1 caso en cola, 2 reintentos en curso', estado: 'Degradado', color: '#9D7700', fondo: '#FFFAE8', documental: true },
  { nombre: 'Firma electrónica', detalle: 'Sin incidentes en las últimas 24 horas', estado: 'Operativo', color: '#158361', fondo: '#E6F3EE' },
  { nombre: 'Correo electrónico', detalle: 'Entregas confirmadas al 98%', estado: 'Operativo', color: '#158361', fondo: '#E6F3EE' },
  { nombre: 'Mensajes de texto (SMS)', detalle: 'Sin incidentes en las últimas 24 horas', estado: 'Operativo', color: '#158361', fondo: '#E6F3EE' },
  { nombre: 'Autenticación de funcionarios', detalle: 'Sin incidentes en las últimas 24 horas', estado: 'Operativo', color: '#158361', fondo: '#E6F3EE' },
]

export default function P34Integraciones() {
  // El enlace a los casos afectados solo tiene sentido si el sistema documental no está operativo.
  const documentalDegradado = SISTEMAS.some((s) => s.documental && s.estado !== 'Operativo')

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Iván Cárdenas</strong> · Administrador técnico · Dirección de Asuntos NARP
      </p>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Integraciones
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
        Estado de los sistemas externos. Ninguna falla aquí detiene el trámite del ciudadano; a lo sumo, lo deja en espera con aviso.
      </p>

      <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {SISTEMAS.map((s, i) => (
            <li
              key={s.nombre}
              style={{
                display: 'flex', gap: 14, alignItems: 'center', padding: '16px 20px',
                ...(i < SISTEMAS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
              }}
            >
              <span aria-hidden="true" style={{ flex: 'none', width: 10, height: 10, borderRadius: '50%', background: s.color }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>
                  {s.nombre}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>
                  {s.detalle}
                </span>
              </div>
              <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', background: s.fondo, color: s.color, border: `1px solid ${s.color}`, borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                {s.estado}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {documentalDegradado && (
        <Link
          to={R.pendientesRadicacion}
          style={{ display: 'inline-block', marginTop: 16, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-link)' }}
        >
          Ver casos afectados por el sistema documental →
        </Link>
      )}
    </Layout>
  )
}
