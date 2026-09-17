import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, ProgressSteps, RadioGroup, Select, TextField } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { R } from '../routes.js'

/** Los 5 pasos del asistente, compartidos por P7 (1-3) y P8 (4). */
export const PASOS_TRAMITE = ['Tipo de trámite', 'Datos del cambio', 'Tu comunidad', 'Documentos', 'Revisar y enviar']

const ENLACE = {
  display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44,
  fontFamily: 'var(--font-body)', fontSize: 14, textDecoration: 'none', color: 'var(--text-link)',
}

/** Flecha «volver», repetida en los cuatro pasos del asistente. */
export function Flecha() {
  return (
    <span aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 5.5 7 12l6.5 6.5" />
      </svg>
    </span>
  )
}

/** Pie común del asistente: salir sin guardar + teléfono de ayuda. */
export function PieTramite({ children }) {
  return (
    <div
      style={{
        marginTop: 32, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center',
        flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: 20,
      }}
    >
      {children ?? (
        <Link to={R.inicio} style={ENLACE}>
          <Flecha />Salir sin guardar
        </Link>
      )}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: 0 }}>
        ¿Prefieres que te ayudemos por teléfono? Llama gratis al <strong>01 8000 000 000</strong>, de lunes a viernes de
        8:00 a.m. a 5:00 p.m.
      </p>
    </div>
  )
}

// El formulario cambia según el tipo elegido en el paso 1 (ids propios del prototipo).
const FORMULARIOS = {
  representante: {
    titulo: 'Datos del nuevo representante legal',
    campos: [
      { key: 'fecha', tipo: 'texto', label: 'Fecha de la asamblea', placeholder: 'DD/MM/AAAA' },
      { key: 'nombre', tipo: 'texto', label: 'Nombre del nuevo representante legal', placeholder: 'Nombre completo' },
      { key: 'cedula', tipo: 'texto', label: 'Número de identificación', placeholder: 'Número de cédula' },
      { key: 'modalidad', tipo: 'radio', label: 'Cómo fue la elección', opciones: ['Asamblea general', 'Asamblea de delegados'] },
    ],
  },
  datos: {
    titulo: 'Qué dato de la comunidad cambió',
    campos: [
      { key: 'campo', tipo: 'radio', label: 'Qué dato cambió', opciones: ['Nombre de la comunidad', 'Sede o dirección', 'Datos de contacto'] },
      { key: 'anterior', tipo: 'texto', label: 'Valor anterior', placeholder: 'Cómo estaba antes' },
      { key: 'nuevo', tipo: 'texto', label: 'Valor nuevo', placeholder: 'Cómo queda ahora' },
    ],
  },
  censo: {
    titulo: 'Datos del nuevo censo',
    campos: [
      { key: 'familias', tipo: 'texto', label: 'Número de familias', placeholder: 'Ejemplo: 128' },
      { key: 'personas', tipo: 'texto', label: 'Número de personas', placeholder: 'Ejemplo: 540' },
      { key: 'fechaCenso', tipo: 'texto', label: 'Fecha del censo', placeholder: 'DD/MM/AAAA' },
    ],
  },
  nueva: {
    titulo: 'Datos básicos de la comunidad',
    campos: [
      { key: 'nombreComunidad', tipo: 'texto', label: 'Nombre de la comunidad', placeholder: 'Nombre completo de la comunidad' },
      { key: 'departamento', tipo: 'select', label: 'Departamento', opciones: ['Chocó', 'Cauca', 'Nariño', 'Valle del Cauca', 'Bolívar', 'San Andrés, Providencia y Santa Catalina'] },
      { key: 'municipio', tipo: 'texto', label: 'Municipio', placeholder: 'Municipio' },
    ],
  },
}

const COMUNIDAD = 'Consejo Comunitario Guapi Abajo Unidos · Guapi, Cauca'

export default function P7Datos() {
  const navegar = useNavigate()
  const [params] = useSearchParams()
  const tipo = FORMULARIOS[params.get('tipo')] ? params.get('tipo') : 'representante'
  const def = FORMULARIOS[tipo]
  const [valores, setValores] = useState({})

  const poner = (key, valor) => setValores((v) => ({ ...v, [key]: valor }))
  const faltan = def.campos.some((c) => !valores[c.key])

  return (
    <Layout ancho={860} padding="32px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '0 0 12px' }}>Paso 2 de 5</p>
      <ProgressSteps steps={PASOS_TRAMITE} current={1} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 42, lineHeight: '50px', color: 'var(--text-title)', margin: '28px 0 8px' }}>
        {def.titulo}
      </h1>
      {tipo !== 'nueva' && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '0 0 24px', maxWidth: '64ch' }}>
          {COMUNIDAD}
        </p>
      )}

      <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {def.campos.map((c) => (
          <div key={c.key}>
            {c.tipo === 'texto' && (
              <TextField
                label={c.label}
                placeholder={c.placeholder}
                value={valores[c.key] ?? ''}
                onChange={(e) => poner(c.key, e.target.value)}
              />
            )}
            {c.tipo === 'radio' && (
              <RadioGroup legend={c.label} options={c.opciones} value={valores[c.key] ?? ''} onChange={(v) => poner(c.key, v)} />
            )}
            {c.tipo === 'select' && (
              <Select label={c.label} placeholder="Elige una opción" options={c.opciones} value={valores[c.key] ?? ''} onChange={(v) => poner(c.key, v)} />
            )}
          </div>
        ))}
      </section>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Link to={R.tramiteTipo} style={ENLACE}>
          <Flecha />Volver al paso 1
        </Link>
        {/* TODO(backend): guardar el borrador del trámite antes de avanzar. */}
        <Button onClick={() => navegar(`${R.tramiteComunidad}?tipo=${tipo}`)} disabled={faltan}>
          Continuar al paso 3
        </Button>
      </div>

      <PieTramite />
    </Layout>
  )
}
