import { Button } from '../ds/index.js'
import Layout from '../components/Layout.jsx'

/**
 * El árbol de clasificación versionado. P35 muestra exactamente esta misma referencia
 * en solo lectura, así que lo importa desde aquí en vez de duplicarlo.
 */
export const ARBOL = {
  version: 3,
  aprobadaEl: '1 de febrero de 2026',
  categorias: [
    {
      nombre: 'Cambio de representante legal',
      incluye: 'el formulario declara un nuevo nombre y documento de identidad como representante.',
      excluye: 'si el cambio es solo de datos de contacto del representante actual.',
    },
    {
      nombre: 'Actualizar los datos de la comunidad',
      incluye: 'el formulario cambia nombre, sede o contacto, sin cambiar personas.',
      excluye: 'si el cambio afecta al número de familias o personas (va a censo).',
    },
    {
      nombre: 'Actualización del censo de integrantes',
      incluye: 'el formulario declara un nuevo número de familias o personas.',
      excluye: 'si el único cambio es de contacto, sin afectar el conteo.',
    },
    {
      nombre: 'Registro de una comunidad nueva',
      incluye: 'la comunidad no tiene un radicado previo en el registro.',
      excluye: 'si ya existe un registro activo con el mismo nombre y municipio.',
    },
  ],
}

/** Tarjeta de categoría, compartida con P35 para que las dos vistas no se separen. */
export function CategoriaArbol({ categoria }) {
  return (
    <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '26px', color: 'var(--text-title)', margin: 0 }}>
        {categoria.nombre}
      </h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '8px 0 0' }}>
        <strong>Se incluye cuando:</strong> {categoria.incluye}
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '6px 0 0' }}>
        <strong>Se excluye cuando:</strong> {categoria.excluye}
      </p>
    </section>
  )
}

export default function P32Arbol() {
  // TODO(backend): proponer una nueva versión abre el editor y crea la versión N+1 pendiente de aprobación.
  const nuevaVersion = () => window.alert('En esta maqueta, proponer una nueva versión no abre un editor todavía.')

  return (
    <Layout backoffice padding="24px 24px 64px">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
            Árbol de clasificación
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
            Versión {ARBOL.version}, aprobada el {ARBOL.aprobadaEl}. El criterio vive aquí, no en la cabeza de una persona.
          </p>
        </div>
        <Button variant="outline" onClick={nuevaVersion}>Proponer nueva versión</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {ARBOL.categorias.map((c) => (
          <CategoriaArbol key={c.nombre} categoria={c} />
        ))}
      </div>
    </Layout>
  )
}
