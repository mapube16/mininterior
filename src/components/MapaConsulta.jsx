import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ESTADOS } from '../mock/datos.js'

// Tiles de Esri: OSM público responde 403 en este entorno (nota del handoff).
const TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
const ATRIBUCION = 'Tiles &copy; Esri'
const CENTRO_COLOMBIA = [4.6, -74.1]

/** Marca de municipio con el conteo de comunidades, en vista agrupada. */
const iconoGrupo = (n, resaltado) =>
  L.divIcon({
    className: '',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;
      background:${resaltado ? '#0943B5' : '#fff'};color:${resaltado ? '#fff' : '#0943B5'};
      border:2px solid #0943B5;font-family:Verdana,sans-serif;font-size:13px;font-weight:700;
      box-shadow:0 1px 4px rgba(0,0,0,.3)">${n}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })

/** Reencuadra el mapa cuando cambian los resultados filtrados. */
function Encuadre({ puntos }) {
  const mapa = useMap()
  const clave = puntos.map((p) => p.id).join(',')
  useMemo(() => {
    if (!puntos.length) return
    const limites = L.latLngBounds(puntos.map((p) => [p.lat, p.lng]))
    mapa.fitBounds(limites, { padding: [40, 40], maxZoom: 9 })
  }, [clave]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

/**
 * Mapa de la consulta pública (P2).
 * `agrupado` alterna marca por municipio (con conteo) y marca por comunidad (color = estado).
 * `hoverId` / `onHover` sincronizan el resaltado con la lista, en ambos sentidos.
 */
export default function MapaConsulta({ comunidades, agrupado, hoverId, onHover, alto = 460 }) {
  const grupos = useMemo(() => {
    const porMunicipio = new Map()
    for (const c of comunidades) {
      const clave = `${c.municipio}·${c.departamento}`
      if (!porMunicipio.has(clave)) porMunicipio.set(clave, { id: clave, municipio: c.municipio, departamento: c.departamento, lat: c.lat, lng: c.lng, miembros: [] })
      porMunicipio.get(clave).miembros.push(c)
    }
    return [...porMunicipio.values()]
  }, [comunidades])

  return (
    <MapContainer
      center={CENTRO_COLOMBIA}
      zoom={6}
      style={{ width: '100%', height: alto }}
      scrollWheelZoom={false}
    >
      <TileLayer url={TILES} attribution={ATRIBUCION} />
      <Encuadre puntos={agrupado ? grupos : comunidades} />

      {agrupado
        ? grupos.map((g) => (
            <Marker
              key={g.id}
              position={[g.lat, g.lng]}
              icon={iconoGrupo(g.miembros.length, g.miembros.some((m) => m.id === hoverId))}
              eventHandlers={{
                mouseover: () => onHover?.(g.miembros[0].id),
                mouseout: () => onHover?.(null),
              }}
            >
              <Tooltip>
                {g.municipio}, {g.departamento} · {g.miembros.length} {g.miembros.length === 1 ? 'comunidad' : 'comunidades'}
              </Tooltip>
            </Marker>
          ))
        : comunidades.map((c) => {
            const activo = c.id === hoverId
            const color = ESTADOS[c.estado]?.color ?? '#4C4C4C'
            return (
              <CircleMarker
                key={c.id}
                center={[c.lat, c.lng]}
                radius={activo ? 11 : 7}
                pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}
                eventHandlers={{
                  mouseover: () => onHover?.(c.id),
                  mouseout: () => onHover?.(null),
                }}
              >
                <Tooltip>
                  {c.nombre} — {c.estado}
                </Tooltip>
              </CircleMarker>
            )
          })}
    </MapContainer>
  )
}

/** Mapa de una sola comunidad: centro en el municipio + círculo de referencia (P3). */
export function MapaMunicipio({ comunidad, alto = 300 }) {
  return (
    <MapContainer center={[comunidad.lat, comunidad.lng]} zoom={10} style={{ width: '100%', height: alto }} scrollWheelZoom={false}>
      <TileLayer url={TILES} attribution={ATRIBUCION} />
      <CircleMarker
        center={[comunidad.lat, comunidad.lng]}
        radius={12}
        pathOptions={{ color: '#0943B5', weight: 2, fillColor: '#0943B5', fillOpacity: 0.25 }}
      >
        <Tooltip permanent direction="top">{comunidad.municipio}, {comunidad.departamento}</Tooltip>
      </CircleMarker>
    </MapContainer>
  )
}
