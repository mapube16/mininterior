import { Button } from '../ds/index.js'
import Layout from '../components/Layout.jsx'

// Cada regla: condición evaluada, mensaje que ve el ciudadano, y severidad
// (Bloqueante impide radicar; Advertencia solo avisa).
const REGLAS = [
  {
    condicion: 'La fecha de la asamblea no puede ser una fecha futura',
    mensaje: 'Revisa la fecha de la asamblea; no puede ser posterior a hoy.',
    severidad: 'Bloqueante',
  },
  {
    condicion: 'El representante propuesto no puede estar vigente en otra comunidad',
    mensaje: 'Esta persona ya aparece como representante legal de otra comunidad. Verifica el dato.',
    severidad: 'Bloqueante',
  },
  {
    condicion: 'No puede existir otra solicitud abierta de la misma comunidad por el mismo motivo',
    mensaje: 'Ya tienes una solicitud de este tipo en trámite. Puedes seguirla en tu bandeja.',
    severidad: 'Bloqueante',
  },
  {
    condicion: 'El nuevo censo no puede cambiar en más del 50% respecto al anterior sin nota',
    mensaje: 'El cambio en el número de personas es grande; cuéntanos brevemente por qué.',
    severidad: 'Advertencia',
  },
]

const SEVERIDAD = {
  Bloqueante: { color: '#A80521', fondo: '#FBE9EC' },
  Advertencia: { color: '#9D7700', fondo: '#FFFAE8' },
}

export default function P31Reglas() {
  // TODO(backend): crear y editar reglas persiste el catálogo que corre sobre el formulario.
  const editar = (r) => window.alert(`En esta maqueta, editar la regla "${r.condicion}" no abre un formulario todavía.`)
  const nuevaRegla = () => window.alert('En esta maqueta, crear una regla nueva no está construido.')

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Patricia Núñez</strong> · Administradora funcional · Dirección de Asuntos NARP
      </p>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Reglas de validación
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
        Corren sobre el formulario, antes de dejar radicar. Cada regla dice qué condición evalúa y qué le muestra al ciudadano.
      </p>

      <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {REGLAS.map((r, i) => {
            const s = SEVERIDAD[r.severidad]
            return (
              <li
                key={r.condicion}
                style={{
                  display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
                  ...(i < REGLAS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>
                    {r.condicion}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 4 }}>
                    Mensaje al ciudadano: “{r.mensaje}”
                  </span>
                </div>
                <span
                  style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', background: s.fondo, color: s.color, border: `1px solid ${s.color}`, borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}
                >
                  {r.severidad}
                </span>
                <button
                  type="button"
                  onClick={() => editar(r)}
                  style={{ flex: 'none', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 14px', minHeight: 36, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-body)' }}
                >
                  Editar
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div style={{ marginTop: 16 }}>
        <Button variant="outline" onClick={nuevaRegla}>Nueva regla</Button>
      </div>
    </Layout>
  )
}
