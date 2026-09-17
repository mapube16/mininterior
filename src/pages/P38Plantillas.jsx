import Layout from '../components/Layout.jsx'

// Una plantilla por tipo de trámite y estado terminal (Favorable / Desfavorable),
// con los campos que el sistema interpola al generar el acto.
const PLANTILLAS = [
  { tramite: 'Cambio de representante legal', terminal: 'Favorable', campos: 'comunidad, municipio, departamento, representante saliente, representante nuevo, antecedentes' },
  { tramite: 'Cambio de representante legal', terminal: 'Desfavorable', campos: 'comunidad, motivo, recursos disponibles' },
  { tramite: 'Actualización del censo', terminal: 'Favorable', campos: 'comunidad, número anterior, número nuevo, fecha del censo' },
  { tramite: 'Registro de comunidad nueva', terminal: 'Favorable', campos: 'nombre, municipio, departamento, acto de constitución' },
]

export default function P38Plantillas() {
  // TODO(backend): la vista previa renderiza la plantilla con un caso real; editar guarda una versión nueva.
  const previsualizar = () => window.alert('En esta maqueta, la vista previa no está construida.')
  const editar = () => window.alert('En esta maqueta, editar la plantilla no abre un formulario todavía.')

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Patricia Núñez</strong> · Administradora funcional · Dirección de Asuntos NARP
      </p>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Plantillas de actos
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
        Una por tipo de trámite y estado terminal. El sistema las llena; el asesor no redacta desde cero.
      </p>

      <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {PLANTILLAS.map((p, i) => (
            <li
              key={`${p.tramite}-${p.terminal}`}
              style={{
                display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
                ...(i < PLANTILLAS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>
                  {p.tramite} — {p.terminal}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>
                  Campos disponibles: {p.campos}
                </span>
              </div>
              <button
                type="button"
                onClick={previsualizar}
                style={{ flex: 'none', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 14px', minHeight: 36, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-body)' }}
              >
                Vista previa
              </button>
              <button
                type="button"
                onClick={editar}
                style={{ flex: 'none', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 14px', minHeight: 36, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-body)' }}
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
