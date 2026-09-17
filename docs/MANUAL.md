# Portal RUPN NARP — manual completo

Sistema de gestión de trámites del **Registro Público Único Nacional de comunidades
negras, afrocolombianas, raizales y palenqueras** — Ministerio del Interior de Colombia.

| | |
|---|---|
| **Portal** | https://web-production-aca85.up.railway.app |
| **API** | https://api-production-0777.up.railway.app/docs |
| **Código** | https://github.com/mapube16/mininterior |

Todos los datos son ficticios. Las comunidades, personas y documentos son inventados; los
municipios sí son reales y las coordenadas del mapa apuntan al centroide municipal, nunca
a la ubicación de una comunidad.

---

## 1. Qué es esto

El registro es donde el Estado inscribe qué organizaciones NARP existen y quién las
representa. Esa inscripción habilita a la comunidad para consulta previa, programas
estatales y contratación: **un trámite atascado deja a una comunidad sin capacidad de
actuar.**

Hoy el proceso es manual y acumula, según el extracto del SGDEA de septiembre de 2026:

| | |
|---|---|
| Casos pendientes | **10.388** |
| De ellos, en una bandeja **sin responsable asignado** | **8.757 (84 %)** |
| Resueltos fuera de término | **77 %** |
| Antigüedad mediana de lo pendiente | 144 días (máximo: 1.543) |

El sistema ataca ese diagnóstico: cada caso tiene siempre un dueño con nombre propio,
los términos se calculan solos y lo que no es competencia se desvía apenas se clasifica.

---

## 2. Cuentas para probar

**Contraseña para todas: `demo1234`**

En la pantalla de ingreso hay **botones de acceso rápido** para las cinco cuentas más
usadas: clic en el botón, clic en "Entrar", sin escribir nada.

| Correo | Nombre | Rol | Entra a |
|---|---|---|---|
| `rosalba.mosquera@correo.com` | Rosalba Mosquera | Ciudadana | Mis solicitudes |
| `sandra.molano@mininterior.gov.co` | Sandra Molano | Clasificador | Bandeja de clasificación |
| `marta.rincon@mininterior.gov.co` | Marta Rincón | Mesa · Coordinador | Bandeja de asignación |
| `daniel.perea@mininterior.gov.co` | Daniel Perea | Asesor (Cauca) | Bandeja del asesor |
| `maria.zapata@mininterior.gov.co` | María Zapata | Asesor (Nariño) | Bandeja del asesor |
| `carlos.renteria@mininterior.gov.co` | Carlos Rentería | Asesor (Chocó) | Bandeja del asesor |
| `elena.vargas@mininterior.gov.co` | Elena Vargas | Revisor · Firmante | Bandeja de revisión |
| `jorge.ibarra@mininterior.gov.co` | Jorge Ibarra | Ventanilla | Radicación asistida |
| `lucia.ospina@mininterior.gov.co` | Lucía Ospina | Admin funcional · técnico | Administración |

> **Un usuario puede tener varios roles.** Marta Rincón es mesa y coordinadora; Elena
> Vargas revisa y firma. No se duplican cuentas por rol, que es lo que pide el diseño.

### Documentos para adjuntar

Tres PDF ficticios en [ejemplos/](ejemplos/):

| Archivo | Para qué trámite |
|---|---|
| `acta-asamblea-ejemplo.pdf` | Cambio de representante, junta directiva, linderos |
| `documento-identidad-ejemplo.pdf` | Cambio de representante legal |
| `listado-censal-ejemplo.pdf` | Actualización del censo |

---

## 3. El flujo completo, pantalla por pantalla

Un caso recorre siete etapas y cambia de manos en cada una. Esto es lo que verás:

```
CIUDADANO                          MINISTERIO
                                   
Inicio                             
  ↓                                
Ingreso ──────────────────────────────────────────────┐
  ↓                                                   │
Tipo de trámite (paso 1)                              │
  ↓                                                   │
Datos del cambio (paso 2)                             │
  ↓                                                   │
Tu comunidad (paso 3)                                 │
  ↓                                                   │
Documentos (paso 4)                                   │
  ↓                                                   │
Revisar y radicar (paso 5)  ← la única compuerta que bloquea
  ↓
  └──→ RADICADO ──→ Bandeja de CLASIFICACIÓN (Sandra)
                      ↓ clasifica
                    Bandeja de ASIGNACIÓN (Marta)
                      ↓ el sistema propone asesor · ella confirma
                    Bandeja del ASESOR (Daniel)
                      ↓ registra sentido y fundamento
                      ↓ ENTONCES se genera el borrador
                    Editor de proyección
                      ↓ envía a pre-revisión
                    Bandeja de REVISIÓN (Elena)
                      ↓ ve hallazgos · aprueba
                    FIRMA (Elena)
                      ↓ radicado oficial EXT-2026-...
Mis solicitudes ←──── el ciudadano ve el estado actualizado
```

### Qué pantalla hace qué

| Pantalla | Ruta | Quién la usa |
|---|---|---|
| Inicio | `/` | Cualquiera |
| Consultar comunidades | `/consulta` | Cualquiera, sin cuenta |
| Ficha pública | `/comunidad/:id` | Cualquiera, sin cuenta |
| Ingreso | `/ingreso` | Todos |
| Mis solicitudes | `/solicitudes` | Ciudadano |
| Estado de la solicitud | `/solicitudes/:radicado` | Ciudadano |
| Asistente de trámite | `/tramite` … `/tramite/enviar` | Ciudadano |
| Bandeja de clasificación | `/bo/clasificacion` | Clasificador |
| Clasificar un caso | `/bo/clasificacion/:radicado` | Clasificador |
| Bandeja de asignación | `/bo/asignacion` | Mesa |
| Asignar un caso | `/bo/asignacion/:radicado` | Mesa |
| Bandeja del asesor | `/bo/asesor` | Asesor |
| Análisis y decisión | `/bo/asesor/:radicado` | Asesor |
| Editor de proyección | `/bo/asesor/:radicado/proyeccion` | Asesor |
| Bandeja de revisión | `/bo/revision` | Revisor |
| Revisar un caso | `/bo/revision/:radicado` | Revisor |
| Bandeja de firma | `/bo/firma` | Firmante |
| Firmar | `/bo/firma/:radicado` | Firmante |

---

## 4. Cómo probarlo

### Recorrido 1 — El ciudadano radica *(5 minutos)*

1. **/ingreso** → botón **"Ciudadana"** → **Entrar**.
   Arriba aparece *"Sesión de Rosalba Mosquera · Ciudadano"*.
2. Menú **"Hacer o seguir un trámite"** → elige uno → avanza los pasos.
3. Paso 4: sube los PDF de ejemplo.
4. Paso 5: **"Radicar mi solicitud"**.
   → Devuelve un número real y la fecha de vencimiento.
5. **"Ver en qué va mi solicitud"** → la línea de tiempo con el historial verdadero.

**Qué mirar:** la fecha de respuesta se calcula en días hábiles colombianos, saltando
fines de semana y festivos. No es un texto fijo.

### Recorrido 2 — Cómo lo ve el Ministerio *(10 minutos)*

Anota el número del caso que radicaste y síguelo:

1. **Clasificadora** (`sandra.molano@`) → **el caso que acabas de radicar está ahí**.
   Ábrelo y clasifícalo.
2. **Mesa** (`marta.rincon@`) → ya llegó. El sistema propone un asesor **y explica por
   qué**: *"Es el asesor con menor carga: 0 casos activos de 8"*. Asigna.
3. **Asesor** (`daniel.perea@`) → abre el caso. **Intenta generar el borrador: está
   bloqueado.** Registra sentido y fundamento; entonces sí se genera.
4. **Revisora** (`elena.vargas@`) → hallazgos y verificaciones. Aprueba y firma.
   → Devuelve un **radicado oficial** (`EXT-2026-...`).
5. Vuelve como **Ciudadana**: el estado de su solicitud cambió.

**Qué mirar:** es el mismo caso pasando de mano en mano. Nadie lo simula.

### Recorrido 3 — Las reglas que no se pueden romper *(5 minutos)*

Esto es lo que separa el sistema de un formulario bonito.

| Prueba esto | Qué pasa | Por qué importa |
|---|---|---|
| Abre `/bo/revision/RUPN-2026-004871` como Elena | **"Devolver al asesor" está bloqueado** | Ese caso ya gastó su único retorno. Sin tope se reconstruye el ciclo infinito del proceso actual |
| Como asesor, intenta proyectar sin decidir | El botón no se activa | Si el borrador va primero, se cede criterio jurídico al modelo |
| Mira la pantalla de revisión | Hallazgos, **nunca un "aprobado"** ni un porcentaje | Un veredicto automático produce sesgo y el revisor deja de revisar |
| Abre una comunidad **sin sesión** | Solo nombre, tipo, municipio, departamento, estado | La pertenencia étnica es dato sensible (Ley 1581 de 2012) |
| Como Ciudadana, entra a `/bo/clasificacion` | Rechazado | Las bandejas internas tienen casos de otras comunidades |

### Recorrido 4 — La lectura automática de documentos *(3 minutos)*

Funciona con **Gemini 3.6 Flash**.

1. https://api-production-0777.up.railway.app/docs
2. **Authorize** → `jorge.ibarra@mininterior.gov.co` / `demo1234`
3. `POST /api/documentos/leer` → **Try it out**
4. `tipo_documento`: `Acta de asamblea` · `archivo`: el PDF de ejemplo

En unos 6 segundos devuelve:

```json
{
  "legible": true,
  "campos": {
    "representante_nombre": "ROSALBA MOSQUERA",
    "representante_documento": "1061700000",
    "fecha_acta": "2026-08-15",
    "comunidad": "Consejo Comunitario Guapi Abajo Unidos",
    "municipio": "Guapi"
  },
  "validado": false
}
```

**Qué mirar:**
- Convirtió *"quince (15) días del mes de agosto de dos mil veintiséis"* → `2026-08-15`.
- Quitó los puntos del número de documento.
- **`validado: false`** — lo extraído se le propone a una persona, que confirma. Nunca
  entra solo al expediente.
- Sube un `.txt` renombrado a `.pdf`: devuelve `legible: false` con
  `marcar_prioritario: true`. **El trámite no se bloquea**, pasa a transcripción manual.

### Recorrido 5 — Las cifras del proyecto *(2 minutos)*

https://api-production-0777.up.railway.app/api/metricas/simulacion

Compara el sistema nuevo contra la línea base real de 43.216 registros. Esas cifras se
**recalculan del extracto** con `backend/ingesta/linea_base.py`; no están escritas a mano.

> **Dos cifras dependen del método de cálculo** y conviene fijarlas con la Dirección antes
> de presentar: la antigüedad mediana de pendientes (95 días en el documento, 144 al
> recalcular) y la mediana del trámite de registro (49 frente a 55).
> Detalle en `backend/ingesta/README.md`.

---

## 5. Qué está implementado

### Funciona de verdad, con datos reales

| | Detalle |
|---|---|
| **Sesión y roles** | Login real con JWT. Cada rol entra a donde trabaja |
| **Radicación** | Crea un caso real, con número de seguimiento y término calculado |
| **El caso viaja** | Clasificación → asignación → asesor → revisión → firma, con persistencia |
| **Seguimiento** | El ciudadano ve su caso y el historial verdadero de lo que pasó |
| **Consulta pública** | Comunidades desde la base, con mapa Leaflet y filtros |
| **Días hábiles** | 18 festivos colombianos calculados, con Ley Emiliani y festivos de Pascua |
| **Validación en origen** | Siete reglas que bloquean antes de radicar |
| **Asignación** | Propone asesor por conflicto de interés, historial, territorio y carga |
| **Enrutamiento** | Tutelas y demandas se desvían sin entrar al flujo estándar |
| **Lectura de documentos** | Gemini extrae campos de actas y censos |
| **Métricas** | Tablero y comparación contra la línea base |
| **Auditoría** | Cada transición queda registrada con actor, fecha y motivo |

**17 de 43 pantallas** están conectadas a la API: todas las del recorrido del caso.

### Las reglas de negocio, donde se aplican

No están en la interfaz — están en el backend, así que no se pueden saltar:

| Regla | Dónde vive |
|---|---|
| Retorno interno único, sin reiniciar el reloj | Máquina de estados |
| La decisión precede al borrador | El endpoint responde 409 |
| La pre-revisión no emite veredicto | El contrato de salida no admite ese campo |
| Ningún fallo de IA detiene un trámite | La capa 2 cae a la capa 1 con aviso |
| Ningún caso queda sin responsable | Cada estado fija su rol |
| El radicado es idempotente | Un reintento no duplica el acto administrativo |
| Los retornos no se le muestran al ciudadano | Marca `visible_ciudadano` |
| El registro público solo expone campos públicos | Lista fija en el modelo de datos |

Lo respaldan **64 pruebas automatizadas** del backend, más **15 comprobaciones que
corren en un navegador real** contra el sistema desplegado: las reglas de negocio
(`pruebas/reglas.mjs`) y el recorrido completo del caso (`pruebas/recorrido-completo.mjs`).

---

## 6. Qué NO está implementado

Para que nadie se lleve una sorpresa delante del cliente.

### No funciona

| | Qué pasa si lo intentas |
|---|---|
| **Crear cuenta nueva** | La pestaña existe pero no crea nada. Solo se entra con las cuentas de este manual |
| **Subir archivos de verdad** | El asistente guarda el nombre del archivo, no su contenido. El endpoint de lectura sí recibe el archivo, pero no está cableado al asistente |
| **Firma electrónica real** | Se simula. El radicado oficial lo genera un mock de ControlDoc |
| **Correo y SMS** | Se registran como enviados; no sale nada |
| **Firma por lote** | El botón existe; firma de a un caso |

### Pantallas que siguen siendo maqueta

Se ven bien y se navegan, pero muestran datos de ejemplo:

| Grupo | Pantallas |
|---|---|
| **Asistente del ciudadano** | Tipo de trámite, datos del cambio, tu comunidad, documentos (pasos 1-4). **El paso 5 sí radica de verdad** |
| **Ventanilla** | Radicación asistida, digitalización |
| **Coordinación** | Tablero de gestión, carga del equipo, mi trabajo, búsqueda global |
| **Consulta interna** | Ficha de comunidad interna, pendientes de radicación, cierre por estado terminal |
| **Administración** | Usuarios, tipos de trámite, reglas, árbol de clasificación, auditoría, integraciones, rúbrica, plantillas, microcopy, clasificación de datos |

### Fuera del alcance del MVP, por decisión

| | Por qué |
|---|---|
| **Migración del histórico** | Los 43.216 casos no se cargan. El alcance lo excluye explícitamente |
| **Catálogo real de comunidades** | Ninguna columna del extracto trae identificador de comunidad; el nombre está dentro de cuerpos de correo con datos personales. Extraerlo exige conciliar variantes y revisión humana |
| **Integración real con ControlDoc** | Se simula, como pide el alcance |
| **Capa 2 de pre-revisión** | El contrato, la validación y el fallback están construidos; falta conectar el modelo |

---

## 7. Decisiones pendientes

Cosas que no puedo decidir yo y conviene cerrar antes de avanzar:

1. **Las dos medianas** (sección 4, recorrido 5). Si el cliente recalcula por su lado y le
   da distinto, es una conversación incómoda.
2. **El catálogo de trámites.** El asistente ciudadano y la pantalla de administración
   ofrecían listas distintas; se unificó en un catálogo con nombre interno y nombre
   ciudadano, pero los nombres oficiales los define la Dirección.
3. **Hasta dónde llega el MVP.** El portal público de consulta está construido aunque el
   alcance lo excluía. Conviene alinear qué se presenta como entregable.

---

## 8. Si algo se ve raro

- **"Mostrando datos de ejemplo"**: el portal no pudo hablar con la API y cayó al
  respaldo. Recarga.
- **Una bandeja vacía** suele ser correcto: a ese rol no le han pasado casos todavía.
- **El primer acceso tarda**: los servicios despiertan tras un rato inactivos.
- **Empezar de cero**: `POST /api/admin/sembrar` recarga los datos iniciales sin duplicar.

---

## 9. Cómo está construido

```
/            Portal: React + Vite, 43 pantallas, kit GOV.CO 9.2
backend/     API: FastAPI + PostgreSQL
  app/       habiles.py (días hábiles) · estados.py (máquina de estados)
             reglas.py (validación) · enrutamiento.py (competencia y asignación)
             prerevision.py · ocr.py (Gemini) · metricas.py
  ingesta/   linea_base.py (recalcula las cifras del extracto)
docs/        Este manual y los PDF de ejemplo
pruebas/     Recorridos verificados en navegador real
```

Desplegado en Railway: tres servicios (portal, API, PostgreSQL). Cada push a `main`
redespliega.
