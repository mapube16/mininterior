import { useEffect, useState } from 'react'
import { api, hayApi } from './cliente.js'

/**
 * Trae datos de la API y cae a los datos de ejemplo si no hay backend configurado
 * o si la petición falla.
 *
 * El respaldo es deliberado: el portal se enseña en presentaciones donde la API
 * puede no estar arriba, y una pantalla en blanco no sirve para mostrar el diseño.
 * `desdeApi` dice de dónde salieron los datos, para poder avisarlo en pantalla.
 */
export function useDatos(cargar, respaldo, deps = []) {
  const [datos, setDatos] = useState(respaldo)
  const [cargando, setCargando] = useState(hayApi)
  const [desdeApi, setDesdeApi] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!hayApi) return

    let vigente = true
    setCargando(true)
    cargar(api)
      .then((r) => {
        if (!vigente) return
        setDatos(r)
        setDesdeApi(true)
        setError(null)
      })
      .catch((e) => {
        if (!vigente) return
        // Se conserva el respaldo: es mejor mostrar el diseño que una pantalla rota.
        setError(e)
        setDesdeApi(false)
      })
      .finally(() => vigente && setCargando(false))

    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { datos, cargando, desdeApi, error }
}
