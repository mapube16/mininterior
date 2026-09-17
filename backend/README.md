# Backend — gestión de trámites NARP

API del sistema de gestión de trámites y PQRSDF de la Dirección de Asuntos para
Comunidades Negras, Afrocolombianas, Raizales y Palenqueras (Ministerio del Interior).

FastAPI + SQLAlchemy + PostgreSQL. Las referencias `§N` apuntan a las secciones del
documento de contexto del proyecto.

## Correr en local

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt     # Linux/macOS: .venv/bin/pip
.venv/Scripts/python -m uvicorn app.main:app --reload
```

Documentación interactiva en http://localhost:8000/docs

```bash
curl -X POST http://localhost:8000/api/admin/sembrar   # datos ficticios de demo
.venv/Scripts/python -m pytest                         # 49 pruebas
```

Sin `DATABASE_URL` usa SQLite, que basta para recorrer el flujo completo.

## Qué hay dentro

```
app/
  habiles.py      Días hábiles colombianos. Calcula los 18 festivos, incluida la
                  Ley Emiliani (traslado al lunes) y los móviles de Pascua.
                  De aquí salen TODOS los vencimientos del sistema.
  estados.py      Máquina de estados. Una transición que no esté declarada no ocurre.
  modelos.py      Modelo de datos (§5). La clasificación por campo vive aquí,
                  no en la presentación (§10).
  reglas.py       Validación en origen: la única compuerta que bloquea (§6.1).
  enrutamiento.py Competencia (§6.2) y asignación con WIP (§6.3).
  prerevision.py  Capa 1 determinística y contrato de la capa 2 (§6.4).
  servicio.py     Transiciones, relojes y traza. Único punto que cambia el estado.
  metricas.py     Tablero y simulación contra la línea base real (§8).
  seguridad.py    JWT y autorización por rol (§7).
  seed.py         Datos ficticios para los tres escenarios de §12.
```

## Reglas que el código hace cumplir

No son detalles de implementación: son las decisiones que sostienen el diseño, y
cada una tiene su prueba.

| Regla | Dónde se aplica |
|---|---|
| El retorno interno es **único** y no reinicia el reloj | `estados.py` + `servicio.mover` |
| La decisión del asesor **precede** al borrador | `POST /casos/{id}/proyeccion` responde 409 sin sentido y fundamento |
| La pre-revisión **no emite veredicto** ni puntaje | `prerevision.Salida` no tiene ese campo; `contrato_valido` rechaza lo que lo traiga |
| Ningún fallo de IA **detiene** un trámite | Si la capa 2 no valida, se entrega la capa 1 con aviso |
| Ningún caso queda **sin dueño** | `ROL_POR_ESTADO` en cada transición; el tablero cuenta `sin_responsable` |
| Lo que no es competencia **se desvía** al clasificar | `enrutamiento.enrutar` |
| El radicado es **idempotente** | `PublicacionRadicado` con clave por caso |
| Los retornos internos **no se le muestran** al ciudadano | `visible_ciudadano=False` |
| El registro público solo expone **campos públicos** | `Comunidad.CAMPOS_PUBLICOS` |

## Términos en días hábiles

Colombia traslada siete festivos al lunes siguiente (Ley 51 de 1983) y tiene cinco
móviles atados a la Pascua. Se calculan, no se listan, para que no caduquen cada año.
Dos festivos pueden coincidir tras el traslado: en 2025 son 18 festivos pero 17 fechas.

## Despliegue

`railway.json` ya trae la configuración. Variables:

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | La inyecta Railway al enlazar Postgres. Sin ella, SQLite. |
| `JWT_SECRET` | **Cambiar en producción.** |
| `CONTROLDOC_FALLA` | `true` fuerza el fallo del documental para demostrar `PENDIENTE_RADICACION`. |

## Lo que se simula (§11)

ControlDoc, la firma electrónica, el correo y el SMS son mocks, como pide el alcance
del MVP. El mock de ControlDoc falla a voluntad para poder demostrar que un reintento
no duplica el acto administrativo.

La capa 2 de pre-revisión (el agente de coherencia) tiene su contrato y su validación
implementados, pero todavía no hay modelo conectado: `prerevision.ejecutar` acepta la
salida por parámetro. Conectar un modelo es implementar esa llamada; el fallback y la
validación del contrato ya están.

## Datos de demostración

Todos ficticios (§13.9): el extracto real trae cédulas y teléfonos de ciudadanos en
cuerpos de correos y no se usa como semilla. Los municipios sí son reales y las
coordenadas son del centroide municipal, nunca de la comunidad.

Usuarios del seed, todos con clave `demo1234`: un clasificador, mesa/coordinadora,
tres asesores, revisora/firmante, ventanilla, administradora y una ciudadana.
