import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { ARBOL, CategoriaArbol } from './P32Arbol.jsx'
import { R } from '../routes.js'

/** Misma referencia que P32, en SOLO LECTURA: la usa el clasificador, no edita ni versiona. */
export default function P35ConsultaArbol() {
  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Sandra Molano</strong> · Clasificadora · Dirección de Asuntos NARP
      </p>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: 0 }}>
        Solo consulta · lo edita la administradora funcional
      </p>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '6px 0 0' }}>
        Árbol de clasificación
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 24px' }}>
        Versión {ARBOL.version}, aprobada el {ARBOL.aprobadaEl}.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ARBOL.categorias.map((c) => (
          <CategoriaArbol key={c.nombre} categoria={c} />
        ))}
      </div>

      <Link
        to={R.clasificacionBandeja}
        style={{ display: 'inline-block', marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-link)' }}
      >
        ← Volver a clasificar
      </Link>
    </Layout>
  )
}
