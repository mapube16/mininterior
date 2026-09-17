import { useState } from 'react'
import { Button, ProgressSteps } from '../ds/index.js'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { PASOS_TRAMITE, PieTramite } from './P7Datos.jsx'
import { R } from '../routes.js'

// Requisitos del trámite de cambio de representante legal (los del prototipo).
const DOCS = [
  { id: 'acta', nombre: 'Acta de la asamblea donde se eligió el nuevo representante', guia: 'Debe verse la fecha, el nombre del nuevo representante y las firmas.', formatos: 'JPG, PNG o PDF · máximo 10 MB' },
  { id: 'cedula', nombre: 'Documento de identidad del nuevo representante', guia: 'Cédula o documento equivalente, por ambos lados si aplica.', formatos: 'JPG, PNG o PDF · máximo 10 MB' },
  { id: 'asistentes', nombre: 'Listado de asistentes a la asamblea', guia: 'Debe tener el nombre y la firma de cada persona que asistió.', formatos: 'JPG, PNG o PDF · máximo 10 MB' },
]

const ENCABEZADO = 'Cambio de representante legal · Consejo Comunitario Guapi Abajo Unidos'

function tamano(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function P8Documentos() {
  const navegar = useNavigate()
  // Guarda el File real elegido por documento; nada se sube en la maqueta.
  const [archivos, setArchivos] = useState({})
  const listos = DOCS.filter((d) => archivos[d.id]).length

  const elegir = (id, e) => {
    const f = e.target.files?.[0]
    if (!f) return
    // TODO(backend): subir el archivo y validar tamaño/formato en el servidor.
    setArchivos((a) => ({ ...a, [id]: f }))
  }

  const quitar = (id) =>
    setArchivos((a) => {
      const { [id]: _, ...resto } = a
      return resto
    })

  return (
    <Layout ancho={860} padding="32px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '0 0 12px' }}>Paso 4 de 5</p>
      <ProgressSteps steps={PASOS_TRAMITE} current={3} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 42, lineHeight: '50px', color: 'var(--text-title)', margin: '28px 0 8px' }}>
        Sube los documentos
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '0 0 4px', maxWidth: '64ch' }}>{ENCABEZADO}</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 24px', maxWidth: '64ch' }}>
        Puedes tomar la foto con el celular. Asegúrate de que se vea completa, sin recortes y con buena luz.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {DOCS.map((d, i) => {
          const arch = archivos[d.id]
          const inputId = `doc-file-${d.id}`
          return (
            <section key={d.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 20, position: 'relative' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span
                  aria-hidden="true"
                  style={{
                    flex: 'none', width: 32, height: 32, borderRadius: '50%', background: 'var(--color-cobalt)', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--text-title)', margin: 0 }}>{d.nombre}</h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-body)', margin: '6px 0 0' }}>{d.guia}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{d.formatos}</p>
                </div>
              </div>

              {arch ? (
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-page)', padding: '14px 16px' }}>
                  <span
                    aria-hidden="true"
                    style={{
                      flex: 'none', width: 32, height: 32, borderRadius: '50%', background: '#E6F3EE', color: '#158361',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)' }}>{arch.name}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)' }}>
                      {tamano(arch.size)} · recibido
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitar(d.id)}
                    style={{ flex: 'none', background: 'none', border: 'none', padding: 8, minHeight: 44, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-link)' }}
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <label
                  htmlFor={inputId}
                  style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, border: '1px dashed var(--border-subtle)', borderRadius: 8, padding: '18px 16px', cursor: 'pointer', background: 'var(--surface-page)' }}
                >
                  <span aria-hidden="true" style={{ flex: 'none', color: 'var(--color-cobalt)' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 15V4M8 8l4-4 4 4" />
                      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                    </svg>
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-body)' }}>
                    Toca para tomar una foto o elegir un archivo
                  </span>
                  <input
                    id={inputId}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => elegir(d.id, e)}
                    style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
                  />
                </label>
              )}
            </section>
          )
        })}
      </div>

      <div
        style={{
          marginTop: 28, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-subtle)',
          padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}
      >
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-body)', margin: 0 }}>
          {listos} de {DOCS.length} documentos listos
        </p>
        <Button disabled={listos < DOCS.length} onClick={() => navegar(R.tramiteEnviar)}>
          Continuar al paso 5
        </Button>
      </div>

      <PieTramite />
    </Layout>
  )
}
