import Layout from '../components/Layout.jsx'

// Cada ítem: enunciado, evidencia esperada, y si se resuelve de forma determinística o con modelo.
const VERIFICACIONES = [
  { enunciado: 'Documentos completos según el tipo de trámite', evidencia: 'cada documento requerido está adjunto y legible.', naturaleza: 'Determinística' },
  { enunciado: 'Fechas coherentes con el registro', evidencia: 'las fechas del acta no son anteriores al registro previo ni futuras.', naturaleza: 'Determinística' },
  { enunciado: 'Representante propuesto sin conflicto en otra comunidad', evidencia: 'no aparece vigente en otro consejo comunitario.', naturaleza: 'Determinística' },
  { enunciado: 'La proyección referencia los antecedentes relevantes', evidencia: 'cita el acto de constitución y el último cambio de representación.', naturaleza: 'Con modelo' },
]

export default function P37Rubrica() {
  // TODO(backend): editar una verificación versiona la rúbrica que ejecuta la pre-revisión.
  const editar = (v) => window.alert(`En esta maqueta, editar la verificación "${v.enunciado}" no abre un formulario todavía.`)

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Patricia Núñez</strong> · Administradora funcional · Dirección de Asuntos NARP
      </p>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Rúbrica de verificación
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
        Lo que la pre-revisión evalúa. Nunca produce un veredicto; solo dice si cada verificación se cumple.
      </p>

      <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {VERIFICACIONES.map((v, i) => (
            <li
              key={v.enunciado}
              style={{
                display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
                ...(i < VERIFICACIONES.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>
                  {v.enunciado}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                  Evidencia esperada: {v.evidencia}
                </span>
              </div>
              <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', background: 'var(--surface-subtle)', color: 'var(--text-body)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                {v.naturaleza}
              </span>
              <button
                type="button"
                onClick={() => editar(v)}
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
