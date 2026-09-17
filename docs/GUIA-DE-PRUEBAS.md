# Guía para probar el portal RUPN NARP

Sistema de gestión de trámites del Registro Público Único Nacional de comunidades negras,
afrocolombianas, raizales y palenqueras — Ministerio del Interior.

| | |
|---|---|
| **Portal** | https://web-production-aca85.up.railway.app |
| **API** | https://api-production-0777.up.railway.app/docs |

Todos los datos son ficticios. Nombres de comunidades, personas y documentos son
inventados.

---

## Cuentas de prueba

**Todas usan la misma contraseña: `demo1234`**

En la pantalla de ingreso hay **botones de acceso rápido** para las cinco cuentas más
usadas: se hace clic en el botón y luego en "Entrar", sin escribir nada.

### Ciudadana

| Correo | Nombre | Qué puede hacer |
|---|---|---|
| `rosalba.mosquera@correo.com` | Rosalba Mosquera | Radicar trámites y seguir los suyos |

### Funcionarios del Ministerio

| Correo | Nombre | Rol | Entra directo a |
|---|---|---|---|
| `sandra.molano@mininterior.gov.co` | Sandra Molano | Clasificador | Bandeja de clasificación |
| `marta.rincon@mininterior.gov.co` | Marta Rincón | Mesa · Coordinador | Bandeja de asignación |
| `daniel.perea@mininterior.gov.co` | Daniel Perea | Asesor (Cauca) | Bandeja del asesor |
| `maria.zapata@mininterior.gov.co` | María Zapata | Asesor (Nariño) | Bandeja del asesor |
| `carlos.renteria@mininterior.gov.co` | Carlos Rentería | Asesor (Chocó) | Bandeja del asesor |
| `elena.vargas@mininterior.gov.co` | Elena Vargas | Revisor · Firmante | Bandeja de revisión |
| `jorge.ibarra@mininterior.gov.co` | Jorge Ibarra | Ventanilla | Radicación asistida |
| `lucia.ospina@mininterior.gov.co` | Lucía Ospina | Admin funcional · técnico | Administración |

> Una cuenta puede tener **varios roles**: Marta Rincón es mesa y coordinadora, Elena
> Vargas revisa y firma. El sistema no duplica cuentas por rol.

### Documentos para adjuntar

En [ejemplos/](ejemplos/) hay tres PDF ficticios listos para subir:

| Archivo | Para qué trámite |
|---|---|
| `acta-asamblea-ejemplo.pdf` | Cambio de representante, junta directiva, linderos |
| `documento-identidad-ejemplo.pdf` | Cambio de representante legal |
| `listado-censal-ejemplo.pdf` | Actualización del censo |

---

## Recorrido 1 — El ciudadano radica y sigue su trámite

**5 minutos.** Es el recorrido más corto y el que mejor se entiende sin explicación.

1. Entra a **/ingreso** → botón **"Ciudadana"** → **Entrar**.
   Arriba aparece *"Sesión de Rosalba Mosquera · Ciudadano"*.
2. Menú **"Hacer o seguir un trámite"** → elige un trámite → avanza los pasos.
3. En el paso 4 sube los PDF de ejemplo.
4. En el paso 5, **"Radicar mi solicitud"**.
   → El sistema devuelve un número real (`RUPN-2026-000012`) y la fecha de vencimiento
   calculada en días hábiles.
5. **"Ver en qué va mi solicitud"** → la línea de tiempo con el historial verdadero.

**Qué mirar:** la fecha de respuesta no es un texto fijo — se calcula en días hábiles
colombianos, saltando fines de semana y festivos.

---

## Recorrido 2 — Cómo lo ve el Ministerio por dentro

**10 minutos.** Un caso avanzando de mano en mano.

1. **Clasificadora** (`sandra.molano@`) → su bandeja tiene los casos recién radicados,
   **incluido el que acabas de crear**. Ábrelo y clasifícalo.
2. **Mesa** (`marta.rincon@`) → el caso ya está aquí. El sistema **propone un asesor y
   explica por qué**: *"Es el asesor con menor carga: 0 casos activos de 8"*. Asigna.
3. **Asesor** (`daniel.perea@`) → abre el caso. **Intenta redactar sin registrar la
   decisión: el botón está bloqueado.** Registra sentido y fundamento, y recién entonces
   se genera el borrador.
4. **Revisora** (`elena.vargas@`) → ve hallazgos y verificaciones. Aprueba y firma.
   → El sistema devuelve un **radicado oficial** (`EXT-2026-...`).
5. Vuelve a entrar como **Ciudadana** y mira su solicitud: el estado cambió.

**Qué mirar:** el caso es el mismo objeto pasando de mano en mano. Nadie lo simula.

---

## Recorrido 3 — Las reglas que el sistema no deja romper

**5 minutos.** Esto es lo que diferencia el sistema de un formulario bonito.

### El retorno al asesor es único

Abre `/bo/revision/RUPN-2026-004871` como **Elena Vargas**. El botón **"Devolver al
asesor" está bloqueado**, con la nota de que ese caso ya gastó su único retorno.

*Por qué importa:* sin tope se reconstruye el ciclo infinito del proceso actual.

### La decisión precede a la redacción

Como **asesor**, entra a un caso: el botón de proyectar está deshabilitado hasta escribir
sentido **y** fundamento.

*Por qué importa:* si el borrador va primero, se cede criterio jurídico al modelo.

### La pre-revisión no da veredicto

En la pantalla de revisión verás hallazgos y verificaciones superadas. **Nunca un
"aprobado" ni un porcentaje de confianza.**

*Por qué importa:* un veredicto automático produce sesgo y el revisor deja de revisar.

### El registro público no filtra datos restringidos

Abre una comunidad **sin iniciar sesión**: solo nombre, tipo, municipio, departamento y
estado. Entra como funcionario y abre la ficha interna: ahí sí están los representantes.

*Por qué importa:* la pertenencia étnica es dato sensible (Ley 1581 de 2012).

### Cada rol ve solo lo suyo

Entra como **Ciudadana** e intenta abrir `/bo/clasificacion`. El sistema lo rechaza.

---

## Recorrido 4 — Las cifras del proyecto

Abre https://api-production-0777.up.railway.app/api/metricas/simulacion

Compara el tiempo del sistema nuevo contra la línea base real (43.216 registros, corte
13/09/2026): **10.388 casos pendientes, 84 % en una bandeja sin responsable, 77 %
resueltos fuera de término.**

Esas cifras se recalculan del extracto con `backend/ingesta/linea_base.py`, no están
escritas a mano.

> **Dos cifras dependen del método de cálculo** y conviene fijarlas antes de presentar:
> la antigüedad mediana de los pendientes (95 días en el documento, 144 al recalcular) y
> la mediana del trámite de registro (49 frente a 55). Ver `backend/ingesta/README.md`.

---

## Qué todavía NO funciona

Para que nadie se lleve una sorpresa delante del cliente:

| No funciona | Detalle |
|---|---|
| **Crear cuenta nueva** | Solo se entra con las cuentas de esta guía |
| **Subir archivos de verdad** | Se guarda el nombre del archivo, no su contenido |
| **Firma electrónica real** | Se simula; el radicado oficial lo genera un mock de ControlDoc |
| **Correo y SMS** | Se registran como enviados, no salen |
| **Pantallas de administración** | Plantillas, reglas y auditoría siguen con datos de ejemplo |

Lo que **sí** es real: la sesión, la radicación, el paso del caso entre roles, los días
hábiles, las reglas de negocio y la separación de datos por rol.

---

## Lectura automática de documentos

Funciona con **Gemini 3.6 Flash**. Se prueba desde la documentación de la API:

1. Abre https://api-production-0777.up.railway.app/docs
2. **Authorize** → `jorge.ibarra@mininterior.gov.co` / `demo1234`
3. `POST /api/documentos/leer` → **Try it out**
4. `tipo_documento`: `Acta de asamblea` · `archivo`: el PDF de [ejemplos/](ejemplos/)

Devuelve, en unos 6 segundos:

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

**Qué mirar:** convirtió *"quince (15) días del mes de agosto de dos mil veintiséis"*
en `2026-08-15` y quitó los puntos del número de documento. Con el listado censal
extrae los conteos como números (210 = 104 + 106).

**`validado: false` es deliberado.** Lo extraído se le propone a una persona, que
corrige y confirma; nunca entra solo al expediente.

**Sube un archivo cualquiera** (un .txt renombrado a .pdf) y verás
`legible: false` con `marcar_prioritario: true`: el trámite no se bloquea, pasa a
transcripción manual. Ningún fallo de IA detiene un caso.

> Falta conectarlo a la pantalla de digitalización (P30), que todavía muestra campos
> de ejemplo. El endpoint ya funciona.

---

## Si algo se ve raro

- **"Mostrando datos de ejemplo"** en un aviso: el portal no pudo hablar con la API y
  cayó al respaldo. Recarga.
- **Una bandeja vacía** suele ser correcto: significa que a ese rol no le han pasado
  casos todavía.
- **El primer acceso tarda**: los servicios despiertan tras un rato inactivos.
- Para empezar de cero: `POST /api/admin/sembrar` recarga los datos iniciales sin
  duplicar lo que ya existe.
