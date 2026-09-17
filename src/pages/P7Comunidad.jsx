import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProgressSteps } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { BotonLink } from '../components/ui.jsx'
import { PASOS_TRAMITE, PieTramite, Flecha } from './P7Datos.jsx'
import { ESTADOS } from '../mock/datos.js'
import { R } from '../routes.js'

// La comunidad vinculada a la cuenta de la maqueta.
const COMUNIDAD = {
  nombre: 'Consejo Comunitario Guapi Abajo Unidos',
  detalle: 'Guapi, Cauca · Consejo comunitario',
  estado: 'En actualización',
}

export default function P7Comunidad() {
  const [params] = useSearchParams()
  const tipo = params.get('tipo') ?? 'representante'
  const [avisoOtra, setAvisoOtra] = useState(false)
  const e = ESTADOS[COMUNIDAD.estado]

  return (
    <Layout ancho={860} padding="32px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '0 0 12px' }}>Paso 3 de 5</p>
      <ProgressSteps steps={PASOS_TRAMITE} current={2} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 42, lineHeight: '50px', color: 'var(--text-title)', margin: '28px 0 8px' }}>
        Confirma tu comunidad
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '0 0 24px', maxWidth: '64ch' }}>
        Esta es la comunidad vinculada a tu cuenta. Este trámite quedará radicado a su nombre.
      </p>

      <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)', padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <span
          aria-hidden="true"
          style={{
            flex: 'none', width: 48, height: 48, borderRadius: 8, border: '1px solid var(--border-subtle)',
            color: 'var(--color-cobalt)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5 12 4l9 6.5" />
            <path d="M5 10v9h14v-9" />
            <path d="M9.5 19v-6h5v6" />
          </svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, lineHeight: '32px', color: 'var(--text-title)', margin: 0 }}>
            {COMUNIDAD.nombre}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0' }}>{COMUNIDAD.detalle}</p>
          <span
            style={{
              marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: e.fondo, color: e.color,
              border: `1px solid ${e.color}`, borderRadius: 24, padding: '4px 14px',
              fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap',
            }}
          >
            <span aria-hidden="true" style={{ fontWeight: 700 }}>{e.glifo}</span>
            {COMUNIDAD.estado} en el registro público
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAvisoOtra(true)}
          style={{
            minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: 0, border: 0, background: 'none',
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-link)', textDecoration: 'underline',
            whiteSpace: 'nowrap', cursor: 'pointer',
          }}
        >
          ¿No es tu comunidad?
        </button>
      </section>

      {avisoOtra && (
        <p
          role="status"
          style={{
            marginTop: 16, border: '1px solid var(--border-subtle)', borderLeft: '4px solid var(--color-golden-brown)',
            borderRadius: 8, background: 'var(--surface-notice)', padding: '16px 20px',
            fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '23px', color: 'var(--text-body)', margin: '16px 0 0',
          }}
        >
          {/* TODO(backend): permitir cambiar la comunidad vinculada a la cuenta. */}
          En esta maqueta tu cuenta solo tiene vinculada esta comunidad.
        </p>
      )}

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Link to={`${R.tramiteDatos}?tipo=${tipo}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontFamily: 'var(--font-body)', fontSize: 14, textDecoration: 'none', color: 'var(--text-link)' }}>
          <Flecha />Volver al paso 2
        </Link>
        <BotonLink to={R.tramiteDocumentos}>Confirmar y continuar al paso 4</BotonLink>
      </div>

      <PieTramite />
    </Layout>
  )
}
