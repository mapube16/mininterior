import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, ProgressSteps } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { Aviso, Datos, Parrafo, Tarjeta } from '../components/ui.jsx'
import { PASOS_TRAMITE, PieTramite } from './P7Datos.jsx'
import { api } from '../api/cliente.js'
import { useSesion } from '../api/sesion.jsx'
import { R, ruta } from '../routes.js'

/**
 * Paso 5: revisar y enviar.
 *
 * Es donde la solicitud se radica de verdad. Antes de enviar corre la validación en
 * origen del servidor: es la única compuerta que bloquea, y está aquí a propósito,
 * porque todavía no corren términos. Una vez radicado, el caso se resuelve.
 */
export default function P8bEnviar() {
  const navegar = useNavigate()
  const [params] = useSearchParams()
  const { usuario } = useSesion()

  const [enviando, setEnviando] = useState(false)
  const [incumplimientos, setIncumplimientos] = useState([])
  const [error, setError] = useState(null)
  const [radicado, setRadicado] = useState(null)

  // Lo que viene del asistente. En el prototipo cada paso guardaba en su pantalla;
  // aquí se recoge de la URL para que el recorrido funcione de punta a punta.
  const solicitud = {
    tipo_tramite: params.get('tipo') || 'representante',
    comunidad_id: params.get('comunidad') || null,
    datos: {
      representante_nombre: params.get('representante') || 'Rosalba Mosquera',
      representante_documento: params.get('documento') || `10${Date.now() % 100000000}`,
      fecha_acta: params.get('fecha_acta') || new Date().toISOString().slice(0, 10),
    },
    documentos: ['Acta de asamblea', 'Documento de identidad del representante'],
  }

  const enviar = async () => {
    setEnviando(true)
    setError(null)
    setIncumplimientos([])
    try {
      const caso = await api.radicar(solicitud)
      setRadicado(caso)
    } catch (e) {
      // 422 = la validación en origen encontró algo que el ciudadano debe corregir.
      const lista = e.cuerpo?.detail?.incumplimientos
      if (lista?.length) setIncumplimientos(lista)
      else setError(e.mensaje)
    } finally {
      setEnviando(false)
    }
  }

  if (radicado) {
    return (
      <Layout ancho={860} padding="32px 24px 64px">
        <Aviso tono="exito" titulo="Tu solicitud quedó radicada">
          Guarda este número: <strong>{radicado.numero}</strong>. Con él puedes consultar en qué va.
        </Aviso>

        <Tarjeta style={{ marginTop: 24 }}>
          <Datos
            items={[
              { label: 'Número de seguimiento', valor: radicado.numero },
              { label: 'Trámite', valor: radicado.tipoCiudadano ?? radicado.tipo },
              { label: 'Comunidad', valor: radicado.comunidad ?? '—' },
              {
                label: 'Respuesta a más tardar',
                valor: radicado.vence
                  ? `${new Date(radicado.vence).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })} (${radicado.diasRestantes} días hábiles)`
                  : '—',
              },
            ]}
          />
        </Tarjeta>

        <Parrafo style={{ marginTop: 20 }}>
          Te avisamos por correo cuando haya novedades. No tienes que hacer nada más por ahora.
        </Parrafo>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <Button onClick={() => navegar(ruta(R.solicitud, { radicado: radicado.numero }))}>
            Ver en qué va mi solicitud
          </Button>
          <Button variant="outline" onClick={() => navegar(R.solicitudes)}>
            Ir a mis solicitudes
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout ancho={860} padding="32px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
        Paso 5 de 5
      </p>
      <ProgressSteps steps={PASOS_TRAMITE} current={4} />

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 30, lineHeight: '38px', color: 'var(--text-title)', margin: '24px 0 8px' }}>
        Revisa y envía tu solicitud
      </h1>
      <Parrafo style={{ maxWidth: '65ch' }}>
        Revisamos que todo esté completo antes de radicar. Mientras no envíes, no corre ningún plazo
        y puedes corregir lo que necesites.
      </Parrafo>

      {!usuario && (
        <div style={{ marginTop: 20 }}>
          <Aviso tono="aviso" titulo="Necesitas entrar a tu cuenta">
            Para radicar hay que identificarse. <a href={R.ingreso}>Entra o crea tu cuenta</a> y vuelve aquí.
          </Aviso>
        </div>
      )}

      {incumplimientos.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Aviso tono="error" titulo="Todavía falta algo">
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              {incumplimientos.map((i) => (
                <li key={i.regla_id + i.mensaje} style={{ marginBottom: 4 }}>{i.mensaje}</li>
              ))}
            </ul>
          </Aviso>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20 }}>
          <Aviso tono="error" titulo="No pudimos radicar">{error}</Aviso>
        </div>
      )}

      <Tarjeta style={{ marginTop: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--text-title)', margin: '0 0 16px' }}>
          Esto es lo que vas a enviar
        </h2>
        <Datos
          items={[
            { label: 'Trámite', valor: 'Cambio de representante legal' },
            { label: 'Nuevo representante', valor: solicitud.datos.representante_nombre },
            { label: 'Fecha del acta', valor: solicitud.datos.fecha_acta },
            { label: 'Documentos adjuntos', valor: `${solicitud.documentos.length} archivos` },
          ]}
        />
      </Tarjeta>

      <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
        <Button onClick={enviar} disabled={enviando || !usuario}>
          {enviando ? 'Radicando...' : 'Radicar mi solicitud'}
        </Button>
        <Button variant="outline" onClick={() => navegar(R.tramiteDocumentos)}>
          Volver a los documentos
        </Button>
      </div>

      <PieTramite />
    </Layout>
  )
}
