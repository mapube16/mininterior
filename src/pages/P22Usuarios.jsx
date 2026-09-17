import { Button } from '../ds/index.js'
import Layout from '../components/Layout.jsx'

// Un funcionario tiene VARIOS roles a la vez: `roles` es una lista, nunca un rol único.
const USUARIOS = [
  { nombre: 'Daniel Perea', correo: 'daniel.perea@mininterior.gov.co', territorio: 'Cauca', roles: ['Asesor'] },
  { nombre: 'María Zapata', correo: 'maria.zapata@mininterior.gov.co', territorio: 'Chocó', roles: ['Asesor'] },
  { nombre: 'Elena Vargas', correo: 'elena.vargas@mininterior.gov.co', territorio: 'Nacional', roles: ['Revisora'] },
  { nombre: 'Marta Rincón', correo: 'marta.rincon@mininterior.gov.co', territorio: 'Nacional', roles: ['Firmante', 'Coordinadora'] },
  { nombre: 'Sandra Molano', correo: 'sandra.molano@mininterior.gov.co', territorio: 'Nacional', roles: ['Clasificadora'] },
]

const LEYENDA_ROLES = [
  'Clasificador', 'Mesa', 'Asesor', 'Revisor', 'Firmante', 'Coordinador',
  'Administrador funcional', 'Administrador técnico', 'Ventanilla / enlace',
]

export default function P22Usuarios() {
  // TODO(backend): crear usuario y editar sus roles abren un formulario contra el directorio de funcionarios.
  const editarRoles = (u) => window.alert(`En esta maqueta, editar los roles de ${u.nombre} no abre un formulario todavía.`)
  const nuevoUsuario = () => window.alert('En esta maqueta, crear un usuario nuevo no está construido.')

  return (
    <Layout backoffice padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Iván Cárdenas</strong> · Administrador técnico · Dirección de Asuntos NARP
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
            Usuarios y roles
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
            Un mismo funcionario puede tener varios roles; el sistema no duplica su cuenta.
          </p>
        </div>
        <Button onClick={nuevoUsuario}>Nuevo usuario</Button>
      </div>

      <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {USUARIOS.map((u, i) => (
            <li
              key={u.correo}
              style={{
                display: 'flex', gap: 16, alignItems: 'center', padding: '16px 20px',
                ...(i < USUARIOS.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>
                  {u.nombre}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>
                  {u.correo} · {u.territorio}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 'none', maxWidth: 340 }}>
                {u.roles.map((r) => (
                  <span
                    key={r}
                    style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--surface-info)', color: 'var(--color-cobalt)', border: '1px solid var(--color-cobalt)', borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '18px', whiteSpace: 'nowrap' }}
                  >
                    {r}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => editarRoles(u)}
                style={{ flex: 'none', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 14px', minHeight: 36, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-body)' }}
              >
                Editar roles
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: '0 0 12px' }}>
          Roles del sistema
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {LEYENDA_ROLES.map((r) => (
            <span
              key={r}
              style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--surface-subtle)', color: 'var(--text-body)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '4px 12px', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap' }}
            >
              {r}
            </span>
          ))}
        </div>
      </section>
    </Layout>
  )
}
