import Layout from '../components/Layout.jsx'

// Matriz campo × nivel de clasificación. Los cuatro campos "Público" son exactamente los
// que muestra el registro público de P2/P3: nombre, tipo de organización, municipio,
// departamento y estado. Cualquier cambio aquí tiene que seguir siendo coherente con eso.
const CAMPOS = [
  { nombre: 'Nombre de la comunidad', nivel: 'Público', publico: 'Sí' },
  { nombre: 'Municipio y departamento', nivel: 'Público', publico: 'Sí' },
  { nombre: 'Estado en el registro', nivel: 'Público', publico: 'Sí' },
  { nombre: 'Tipo de organización', nivel: 'Público', publico: 'Sí' },
  { nombre: 'Nombre del representante legal', nivel: 'Autenticado', publico: 'No' },
  { nombre: 'Documento de identidad y contacto', nivel: 'Restringido', publico: 'No' },
  { nombre: 'Censo detallado de integrantes', nivel: 'Restringido', publico: 'No' },
  { nombre: 'Coordenadas del territorio', nivel: 'Restringido', publico: 'No' },
]

const NIVELES = {
  'Público': { color: '#158361', fondo: '#E6F3EE' },
  'Autenticado': { color: '#9D7700', fondo: '#FFFAE8' },
  'Restringido': { color: '#A80521', fondo: '#FBE9EC' },
}

const COLUMNAS = '2fr 1fr 1fr'

export default function P40ClasifDatos() {
  return (
    <Layout backoffice padding="24px 24px 64px">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Clasificación de datos
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
        Qué campo tiene qué nivel, y cuál se publica en la consulta pública. Cambiar esto queda registrado en la auditoría.
      </p>

      <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLUMNAS, padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          <span>Campo</span>
          <span>Nivel</span>
          <span>En el portal público</span>
        </div>
        {CAMPOS.map((c, i) => {
          const n = NIVELES[c.nivel]
          return (
            <div
              key={c.nombre}
              style={{
                display: 'grid', gridTemplateColumns: COLUMNAS, alignItems: 'center', padding: '14px 20px',
                ...(i < CAMPOS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)' }}>{c.nombre}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', background: n.fondo, color: n.color, border: `1px solid ${n.color}`, borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap', width: 'fit-content' }}>
                {c.nivel}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-body)' }}>{c.publico}</span>
            </div>
          )
        })}
      </section>
    </Layout>
  )
}
