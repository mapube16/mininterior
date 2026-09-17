import Layout from '../components/Layout.jsx'

// Los nombres de trámite del handoff no coinciden uno a uno con TIPOS_TRAMITE de datos.js
// (aquí hay "Actualizar los datos de la comunidad" y "Registro de una comunidad nueva"),
// así que se copian del .dc.html con su vigencia y requisitos.
const TIPOS = [
  {
    nombre: 'Cambio de representante legal',
    vigencia: '1 de febrero de 2026',
    requisitos: [
      'Acta de la asamblea con fecha, nombre del nuevo representante y firmas',
      'Documento de identidad del nuevo representante',
      'Listado de asistentes a la asamblea',
    ],
  },
  {
    nombre: 'Actualizar los datos de la comunidad',
    vigencia: '1 de febrero de 2026',
    requisitos: [
      'Descripción del dato que cambia y su valor anterior y nuevo',
      'Soporte del cambio cuando aplique (por ejemplo, nueva dirección)',
    ],
  },
  {
    nombre: 'Actualización del censo de integrantes',
    vigencia: '15 de marzo de 2026',
    requisitos: ['Nuevo número de familias y de personas', 'Fecha en que se hizo el censo'],
  },
  {
    nombre: 'Registro de una comunidad nueva',
    vigencia: '1 de febrero de 2026',
    requisitos: [
      'Nombre de la comunidad, municipio y departamento',
      'Acta de constitución de la comunidad',
      'Listado censal inicial',
    ],
  },
]

export default function P23TiposTramite() {
  // TODO(backend): editar requisitos crea una versión nueva del tipo de trámite con su fecha de vigencia.
  const editar = (t) => window.alert(`En esta maqueta, editar los requisitos de "${t.nombre}" no abre un formulario todavía.`)

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Patricia Núñez</strong> · Administradora funcional · Dirección de Asuntos NARP
      </p>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Tipos de trámite y requisitos
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
        La Dirección edita esto sin depender del proveedor. Cada cambio queda versionado con su fecha de vigencia.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {TIPOS.map((t) => (
          <section key={t.nombre} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '26px', color: 'var(--text-title)', margin: 0 }}>
                  {t.nombre}
                </h2>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', marginTop: 4 }}>
                  Vigente desde el {t.vigencia}
                </span>
              </div>
              <button
                type="button"
                onClick={() => editar(t)}
                style={{ flex: 'none', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 14px', minHeight: 36, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-body)' }}
              >
                Editar
              </button>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {t.requisitos.map((r) => (
                <li key={r} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-body)' }}>
                  <span aria-hidden="true" style={{ color: 'var(--color-cobalt)' }}>•</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Layout>
  )
}
