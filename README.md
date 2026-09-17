# Portal RUPN NARP — frontend

Registro Público Único Nacional de comunidades negras, afrocolombianas, raizales y palenqueras
(Ministerio del Interior, dominio GOV.CO).

Port a React + Vite de las 41 pantallas del handoff de diseño `design_handoff_rupn_narp`:
portal público de consulta, flujo ciudadano de radicación y back office interno (clasificación,
asignación, análisis, revisión, firma y administración).

## Correr en local

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # compila a dist/
npm start        # sirve dist/ como en producción
npm run lint
```

## Estructura

```
src/
  ds/          Kit UI GOV.CO 9.2 (tokens CSS + componentes) tal como vino del handoff.
               index.js es un shim: el kit viene compilado como IIFE que espera
               window.React, así que le damos el global y reexporta sus componentes.
  components/  Layout (el esqueleto de las 41 pantallas), ui.jsx (primitivas
               compartidas: Estado, Aviso, Tarjeta, Fila...), MapaConsulta (Leaflet).
  mock/        datos.js — TODOS los datos de ejemplo, en un solo módulo.
  pages/       Una pantalla por archivo, nombradas P<N><Nombre>.jsx como en el handoff.
  routes.js    Mapa de rutas; cada una anotada con la pantalla PN de origen.
```

## Estado actual

Frontend con **datos de ejemplo**, sin backend. Los puntos donde haría falta una llamada real
están marcados con `// TODO(backend):` — buscar ese texto da el inventario de lo que hay que
cablear. El estado vive en cada pantalla con `useState`; no hay store global, igual que el
prototipo.

Lo que el port conserva a propósito, porque son decisiones de diseño y no detalles:

- El registro público (P3) muestra solo nombre, tipo de organización, municipio, departamento
  y estado. Nunca dirigentes, contactos, censo ni coordenadas exactas — eso es P25, la ficha interna.
- Un caso solo puede devolverse del revisor al asesor **una vez** (P13).
- El asesor registra sentido y fundamento **antes** de que exista cualquier borrador (P10):
  el sistema llena, no decide.
- La pre-revisión nunca da veredicto ni porcentaje de confianza (P13), solo hallazgos y
  verificaciones superadas.
- La firma por lote exige confirmación individual de cada documento (P15).
- El color nunca va solo: todo estado lleva además un símbolo (✓ ↻ • !).

## Despliegue en Railway

`railway.json` ya trae la configuración. El build genera `dist/` y `npm start` lo sirve con
`sirv --single` (el `--single` es lo que hace que recargar `/consulta` no dé 404, porque el
enrutamiento es del lado del cliente). Railway inyecta `PORT`.

## Mapas

Leaflet con tiles de Esri World Street Map (el OSM público responde 403 desde este entorno,
según la nota del handoff). En P2 el hover está sincronizado en ambos sentidos entre la lista
y el mapa, y alterna entre marca agrupada por municipio y una marca por comunidad.
