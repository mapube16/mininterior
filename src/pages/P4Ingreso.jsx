import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, TextField } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { Aviso, BotonLink } from '../components/ui.jsx'
import { INICIO_POR_ROL, useSesion } from '../api/sesion.jsx'
import { R } from '../routes.js'

// Cuentas sembradas para la demostración: una por rol, todas con la misma clave.
const CUENTAS_DEMO = [
  ['rosalba.mosquera@correo.com', 'Ciudadana'],
  ['sandra.molano@mininterior.gov.co', 'Clasificadora'],
  ['marta.rincon@mininterior.gov.co', 'Mesa y coordinación'],
  ['daniel.perea@mininterior.gov.co', 'Asesor'],
  ['elena.vargas@mininterior.gov.co', 'Revisora y firmante'],
]
const CLAVE_DEMO = 'demo1234'

const PASOS_CUENTA = [
  {
    titulo: 'Cuéntanos quién eres',
    detalle: 'Tu nombre, tu número de documento y un correo o celular donde podamos avisarte.',
  },
  {
    titulo: 'Dinos a qué comunidad perteneces',
    detalle: 'La buscas por nombre o municipio. Si todavía no está en el registro, también puedes seguir.',
  },
  {
    titulo: 'Sube una foto del acta o del documento que te acredita',
    detalle: 'Una foto tomada con el celular sirve. Revisamos y te confirmamos en máximo tres días hábiles.',
  },
]

const TAB_BASE = {
  flex: 1, minHeight: 56, border: 0, background: 'none',
  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, cursor: 'pointer', padding: '0 16px',
}
const TAB_ON = { ...TAB_BASE, color: 'var(--color-cobalt)', boxShadow: 'inset 0 -4px 0 var(--color-cobalt)', background: 'var(--surface-info)' }
const TAB_OFF = { ...TAB_BASE, color: 'var(--text-body)' }

export default function P4Ingreso() {
  const navegar = useNavigate()
  const { entrar } = useSesion()
  const [vista, setVista] = useState('entrar')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState(null)
  const [entrando, setEntrando] = useState(false)
  const esEntrar = vista === 'entrar'

  const enviar = async (e) => {
    e?.preventDefault()
    setError(null)
    setEntrando(true)
    try {
      const u = await entrar(correo.trim(), clave)
      // Cada rol entra directo a donde trabaja.
      const rol = (u.roles ?? [])[0]
      navegar(INICIO_POR_ROL[rol] ?? R.solicitudes)
    } catch (err) {
      setError(err.mensaje ?? 'No pudimos entrar. Revisa el correo y la contraseña.')
    } finally {
      setEntrando(false)
    }
  }

  const usarCuenta = (c) => {
    setCorreo(c)
    setClave(CLAVE_DEMO)
    setError(null)
  }

  return (
    <Layout ancho={760} padding="40px 24px 64px">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0, textAlign: 'center' }}>
        Entra a tu cuenta
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '12px auto 0', textAlign: 'center', maxWidth: '58ch' }}>
        Con tu cuenta puedes avisar de un cambio en tu comunidad y ver en qué va tu solicitud. Consultar información
        pública no necesita cuenta.
      </p>

      <div style={{ marginTop: 28, border: '1px solid var(--border-subtle)', borderRadius: 10, background: 'var(--surface-card)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={() => setVista('entrar')} aria-pressed={esEntrar} style={esEntrar ? TAB_ON : TAB_OFF}>
            Ya tengo cuenta
          </button>
          <button type="button" onClick={() => setVista('primera')} aria-pressed={!esEntrar} style={esEntrar ? TAB_OFF : TAB_ON}>
            Es mi primera vez
          </button>
        </div>

        {esEntrar ? (
          <form style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={enviar}>
            {error && <Aviso tono="error" titulo="No pudimos entrar">{error}</Aviso>}
            <TextField
              label="Tu correo electrónico"
              placeholder="nombre@correo.com"
              type="email"
              help="El mismo correo con el que creaste la cuenta."
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <TextField
              label="Tu contraseña"
              placeholder="Escribe tu contraseña"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <BotonLink to={R.consulta} variant="text">Consultar sin cuenta</BotonLink>
              <Button type="submit" disabled={entrando || !correo || !clave}>
                {entrando ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>

            {/* Atajo de la demostración: evita teclear correos largos al mostrar el sistema. */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 18, marginTop: 4 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                Cuentas de demostración (clave <strong>{CLAVE_DEMO}</strong>):
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CUENTAS_DEMO.map(([c, etiqueta]) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => usarCuenta(c)}
                    style={{
                      minHeight: 36, padding: '0 12px', borderRadius: 6, cursor: 'pointer',
                      border: `1px solid ${correo === c ? 'var(--color-cobalt)' : 'var(--border-subtle)'}`,
                      background: correo === c ? 'var(--surface-info)' : 'var(--surface-card)',
                      fontFamily: 'var(--font-body)', fontSize: 13,
                      color: correo === c ? 'var(--color-cobalt)' : 'var(--text-body)',
                    }}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, lineHeight: '28px', color: 'var(--text-title)', margin: 0 }}>
              Crear tu cuenta toma tres pasos. Puedes hacerlo desde el celular.
            </p>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PASOS_CUENTA.map((p, i) => (
                <li key={p.titulo} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span
                    aria-hidden="true"
                    style={{
                      flex: 'none', width: 36, height: 36, borderRadius: '50%', background: 'var(--color-cobalt)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>
                      {p.titulo}
                    </span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', marginTop: 4 }}>
                      {p.detalle}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <BotonLink to={R.tramiteTipo}>Empezar el primer paso</BotonLink>
              <Button variant="outline" href="#ayuda">Prefiero que me ayuden</Button>
            </div>
          </div>
        )}
      </div>

      <div id="ayuda" style={{ marginTop: 20, border: '1px solid var(--border-subtle)', borderRadius: 10, background: 'var(--surface-info)', padding: '20px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '26px', color: 'var(--text-title)', margin: 0 }}>
          ¿Necesitas ayuda para entrar?
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0' }}>
          Te acompañamos por teléfono mientras haces el trámite, o en persona en la Dirección de Asuntos NARP y en las
          alcaldías con convenio.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-title)', margin: 0 }}>
            <strong>Línea gratuita:</strong> 01 8000 000 000, lunes a viernes de 8:00 a.m. a 5:00 p.m.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-title)', margin: 0 }}>
            <strong>Atención presencial:</strong> <a href="#ayuda">ver puntos de atención</a>
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: 20, border: '1px dashed var(--border-default)', borderRadius: 10, background: 'var(--surface-subtle)',
          padding: '20px 24px', display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)', margin: 0 }}>
            Soy funcionario y voy a radicar en nombre de una comunidad
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '6px 0 0' }}>
            Entra al modo asistido con tu usuario institucional. Queda registrado que el trámite lo radicó un funcionario.
          </p>
        </div>
        <BotonLink to={R.radicacionAsistida} variant="text">Ir al modo asistido</BotonLink>
      </div>
    </Layout>
  )
}
