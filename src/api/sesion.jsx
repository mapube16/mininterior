import { createContext, useContext, useEffect, useState } from 'react'
import { api, guardarSesion } from './cliente.js'

/**
 * Quién está usando el sistema, disponible en todas las pantallas.
 *
 * La sesión se guarda en sessionStorage: sobrevive a recargar la página pero no a
 * cerrar el navegador, que es lo razonable para un sistema con datos restringidos.
 */
const Ctx = createContext(null)

export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al abrir, si había un token guardado se comprueba que siga siendo válido.
  useEffect(() => {
    let vigente = true
    api
      .yo()
      .then((u) => vigente && setUsuario(u))
      .catch(() => vigente && setUsuario(null))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [])

  const entrar = async (correo, clave) => {
    const datos = await api.entrar(correo, clave)
    const u = { id: null, nombre: datos.nombre, roles: datos.roles }
    setUsuario(u)
    return u
  }

  const salir = () => {
    guardarSesion(null)
    setUsuario(null)
  }

  const tieneRol = (...roles) => roles.some((r) => (usuario?.roles ?? []).includes(r))

  return (
    <Ctx.Provider value={{ usuario, cargando, entrar, salir, tieneRol }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSesion() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSesion necesita estar dentro de <ProveedorSesion>')
  return ctx
}

/** Nombre legible de cada rol, para mostrarlo en pantalla. */
export const NOMBRE_ROL = {
  ciudadano: 'Ciudadano',
  clasificador: 'Clasificador',
  mesa: 'Mesa de asignación',
  asesor: 'Asesor',
  revisor: 'Revisor',
  firmante: 'Firmante',
  coordinador: 'Coordinador',
  admin_funcional: 'Administrador funcional',
  admin_tecnico: 'Administrador técnico',
  ventanilla: 'Ventanilla',
}

/** A dónde llega cada rol al entrar. */
export const INICIO_POR_ROL = {
  ciudadano: '/solicitudes',
  clasificador: '/bo/clasificacion',
  mesa: '/bo/asignacion',
  asesor: '/bo/asesor',
  revisor: '/bo/revision',
  firmante: '/bo/firma',
  coordinador: '/bo/tablero',
  admin_funcional: '/bo/admin/tipos-tramite',
  admin_tecnico: '/bo/admin/usuarios',
  ventanilla: '/bo/radicacion',
}
