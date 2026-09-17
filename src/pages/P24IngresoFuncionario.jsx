import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, TextField } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { Parrafo } from '../components/ui.jsx'
import { R } from '../routes.js'

// Un mismo funcionario puede tener varios roles sin duplicar cuentas: por eso el
// paso de elegir rol viene después del código de verificación.
const ROLES = [
  { nombre: 'Clasificador', permisos: 'Confirma o corrige la categoría del trámite. No ve documentos originales, solo los campos estructurados.', href: R.clasificacionBandeja },
  { nombre: 'Mesa de asignación', permisos: 'Asigna asesor y completa el expediente. No decide sobre el fondo del caso.', href: R.asignacionBandeja },
  { nombre: 'Asesor', permisos: 'Analiza el caso, registra la decisión y redacta la proyección. No puede firmar ni radicar.', href: R.asesorBandeja },
  { nombre: 'Revisor', permisos: 'Verifica la proyección y aprueba o cambia el sentido. No puede editar el borrador del asesor.', href: R.revisionBandeja },
  { nombre: 'Firmante', permisos: 'Firma el acto aprobado y cierra el caso. No participa en el análisis previo.', href: R.firmaBandeja },
  { nombre: 'Coordinador', permisos: 'Ve indicadores, casos en riesgo y reasigna. No abre ni decide casos individuales.', href: R.tableroGestion },
  { nombre: 'Administrador funcional', permisos: 'Edita tipos de trámite, reglas, rúbricas y textos. No ve casos de ciudadanos concretos.', href: R.tiposTramite },
  { nombre: 'Administrador técnico', permisos: 'Gestiona usuarios, auditoría e integraciones. No decide sobre trámites.', href: R.usuarios },
  { nombre: 'Ventanilla / enlace', permisos: 'Radica en nombre de una comunidad, con registro de quién autorizó. No ve casos de otras comunidades.', href: R.radicacionAsistida },
]

export default function P24IngresoFuncionario() {
  const [etapa, setEtapa] = useState('login')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [codigo, setCodigo] = useState('')

  // TODO(backend): autenticar contra el directorio institucional y enviar el código de verificación.
  const enviarCodigo = () => setEtapa('codigo')

  // TODO(backend): validar el código de verificación de segundo factor.
  const verificar = () => setEtapa('rol')

  return (
    <Layout backoffice ancho={etapa === 'rol' ? 640 : 420} padding="56px 24px 64px">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 30, lineHeight: '38px', color: 'var(--text-title)', margin: '0 0 4px' }}>
        Gestión interna
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 28px' }}>
        Registro Público NARP · Dirección de Asuntos NARP
      </p>

      {etapa === 'login' && (
        <div>
          <TextField
            label="Usuario institucional"
            placeholder="nombre.apellido@mininterior.gov.co"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <div style={{ marginTop: 14 }}>
            <TextField label="Contraseña" placeholder="Escribe tu contraseña" type="password" value={clave} onChange={(e) => setClave(e.target.value)} />
          </div>
          <div style={{ marginTop: 20 }}>
            <Button disabled={!correo || !clave} onClick={enviarCodigo}>Continuar</Button>
          </div>
        </div>
      )}

      {etapa === 'codigo' && (
        <div>
          <Parrafo style={{ fontSize: 14, lineHeight: '22px', margin: '0 0 14px' }}>
            Te enviamos un código de verificación a tu correo institucional.
          </Parrafo>
          <TextField label="Código de verificación" placeholder="6 dígitos" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          <div style={{ marginTop: 20 }}>
            <Button disabled={!codigo} onClick={verificar}>Verificar y entrar</Button>
          </div>
        </div>
      )}

      {etapa === 'rol' && (
        <div style={{ maxWidth: 640 }}>
          <Parrafo style={{ color: 'var(--text-title)', margin: '0 0 4px' }}><strong>Elige con qué rol vas a trabajar hoy.</strong></Parrafo>
          <Parrafo style={{ fontSize: 14, lineHeight: '22px', margin: '0 0 16px' }}>
            Cada rol ve y puede hacer solo lo que le corresponde. Un mismo funcionario puede tener varios roles sin que se
            dupliquen las cuentas.
          </Parrafo>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLES.map((r) => (
              <Link
                key={r.nombre}
                to={r.href}
                style={{ display: 'block', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '14px 16px', textDecoration: 'none' }}
              >
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '22px', color: 'var(--text-title)' }}>{r.nombre}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', marginTop: 2 }}>{r.permisos}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}
