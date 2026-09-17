# Portal RUPN NARP

Registro Público Único Nacional de comunidades negras, afrocolombianas, raizales y
palenqueras — Ministerio del Interior de Colombia, dominio GOV.CO.

| | |
|---|---|
| **Portal** | https://web-production-aca85.up.railway.app |
| **API** | https://api-production-0777.up.railway.app — [documentación interactiva](https://api-production-0777.up.railway.app/docs) |

Sistema de gestión de trámites del registro: consulta pública de comunidades, radicación
en línea para el ciudadano y back office para los nueve roles que tramitan el caso
(clasificación, asignación, análisis, proyección, pre-revisión, revisión, firma,
coordinación y administración).

Reemplaza un flujo manual de nueve etapas que hoy acumula **10.388 casos pendientes**, de
los cuales 8.740 (84 %) están en una mesa de entrada sin responsable asignado. La mediana
de resolución de un trámite de registro es de **49 días hábiles** y el 77 % se resuelve
fuera de término.

## Qué hay en el repo

```
/                 Portal (React + Vite): las 41 pantallas del handoff de diseño.
backend/          API (FastAPI + PostgreSQL): dominio, reglas y métricas.
```

Cada uno se despliega por separado en Railway y `backend/` tiene su propio README con el
detalle del dominio.

## Correr en local

**Portal**

```bash
npm install
npm run dev                  # http://localhost:5173
```

**API**

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt    # Linux/macOS: .venv/bin/pip
.venv/Scripts/python -m uvicorn app.main:app --reload
curl -X POST http://localhost:8000/api/admin/sembrar # datos ficticios de demo
```

Sin `DATABASE_URL` la API usa SQLite, que basta para recorrer el flujo completo. Sin
`VITE_API_URL` el portal apunta a la API desplegada; si no responde, cae a los datos de
ejemplo para que el diseño siga viéndose.

## Pruebas

```bash
npm run build && npm run lint
npm run test:reglas          # reglas de negocio en navegador real (necesita el portal servido)
cd backend && .venv/Scripts/python -m pytest      # 49 pruebas
```

`pruebas/reglas.mjs` acepta `BASE_URL` para correr contra el despliegue en vez de local.

## Reglas que el sistema hace cumplir

No son detalles de implementación: son las decisiones que sostienen el diseño. Cada una
está en el backend —no en la interfaz— y tiene su prueba.

| Regla | Por qué | Dónde |
|---|---|---|
| El retorno interno es **único** y no reinicia el reloj | Sin tope se reconstruye el ciclo infinito del proceso actual | `estados.py`, `servicio.mover` |
| La decisión del asesor **precede** al borrador | Si el borrador va primero, se cede criterio jurídico al modelo | `POST /casos/{id}/proyeccion` → 409 |
| La pre-revisión **no emite veredicto** ni puntaje | Un "aprobado" produce sesgo de automatización y el revisor deja de revisar | `prerevision.py` |
| Ningún fallo de IA **detiene** un trámite | Siempre hay vía manual | La capa 2 cae a la capa 1 con aviso |
| Ningún caso queda **sin dueño** | Es el fallo que produjo los 8.740 casos atascados | `ROL_POR_ESTADO`, tablero |
| Lo que no es competencia **se desvía** al clasificar | Hoy 854 demandas y 2.374 tutelas caen en la misma bandeja | `enrutamiento.py` |
| La publicación del radicado es **idempotente** | Un reintento mal hecho duplica actos administrativos | `PublicacionRadicado` |
| Los retornos internos **no se le muestran** al ciudadano | Ver la barra retroceder genera llamadas | `visible_ciudadano` |
| El registro público solo expone **campos públicos** | Ley 1581 de 2012: la pertenencia étnica es dato sensible | `Comunidad.CAMPOS_PUBLICOS` |
| El color **nunca va solo** | Accesibilidad: todo estado lleva símbolo (✓ ↻ • !) | `components/ui.jsx` |

Los términos se cuentan en **días hábiles colombianos calculados**, con el traslado de la
Ley Emiliani y los festivos móviles de Pascua. De ahí sale todo vencimiento del sistema.

## Estructura del portal

```
src/
  ds/          Kit UI GOV.CO 9.2 tal como vino del handoff. index.js es un shim:
               el kit viene compilado como IIFE que espera window.React, así que
               le damos el global y reexporta sus 24 componentes.
  api/         cliente.js traduce entre los enums del backend y las etiquetas del
               diseño, en un solo sitio. useDatos.js cae a los datos de ejemplo.
  components/  Layout (el esqueleto de las 41 pantallas), ui.jsx (Estado, Aviso,
               Tarjeta, Fila...), MapaConsulta (Leaflet).
  mock/        datos.js — los datos de ejemplo, en un solo módulo.
  pages/       Una pantalla por archivo, P<N><Nombre>.jsx como en el handoff.
  routes.js    Mapa de rutas, cada una anotada con su pantalla de origen.
```

Las rutas se cargan de forma diferida: el trozo de Leaflet (156 kB) no se descarga en el
back office, que nunca muestra mapas. Importa porque el sistema se usa desde móviles de
gama baja con 2G/3G.

## Estado actual

Las pantallas de consulta pública ya consumen la API. El back office sigue con datos de
ejemplo; `src/api/cliente.js` ya expone todos los endpoints que necesita, así que es
cablear, no diseñar. Los puntos pendientes están marcados con `// TODO(backend):`.

Se simulan, como pide el alcance del MVP: ControlDoc (el radicado oficial), la firma
electrónica, el correo y el SMS. El mock de ControlDoc falla a voluntad —variable
`CONTROLDOC_FALLA`— para poder demostrar que un reintento no duplica el acto.

La capa 2 de pre-revisión (el agente de coherencia) tiene contrato, validación y fallback
implementados, pero todavía sin modelo conectado: `prerevision.ejecutar` acepta la salida
por parámetro. Conectar un modelo es implementar esa llamada; lo que protege del sesgo de
automatización ya está.

## Despliegue

Tres servicios en Railway: `web` (portal), `api` (raíz `backend/`) y PostgreSQL.

| Variable | Servicio | Para qué |
|---|---|---|
| `VITE_API_URL` | web | A qué API apunta. Vite la inyecta **en build**, no en runtime. |
| `DATABASE_URL` | api | La inyecta Railway al enlazar Postgres. Sin ella, SQLite. |
| `JWT_SECRET` | api | **Cambiar en producción.** |
| `CONTROLDOC_FALLA` | api | `true` fuerza el fallo del documental para la demostración. |

El portal se sirve con `sirv --single`: el `--single` es lo que hace que recargar
`/consulta` no dé 404, porque el enrutamiento es del lado del cliente.

## Datos

Todos los datos de demostración son **ficticios**. El extracto real contiene cédulas y
teléfonos de ciudadanos en cuerpos de correos y no se usa como semilla. Los municipios sí
son reales y las coordenadas son del **centroide municipal**, nunca de la ubicación de la
comunidad.

Usuarios del seed, todos con clave `demo1234`: clasificadora, mesa/coordinadora, tres
asesores, revisora/firmante, ventanilla, administradora y una ciudadana. Un usuario puede
tener varios roles; no se duplican cuentas.

## Mapas

Leaflet con tiles de Esri World Street Map (el OSM público responde 403 desde este
entorno). En la consulta el hover está sincronizado en ambos sentidos entre la lista y el
mapa, y alterna entre marca agrupada por municipio y una marca por comunidad.
