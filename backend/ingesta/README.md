# Ingesta del extracto del SGDEA

Las cifras de la línea base son el argumento del proyecto, así que se derivan del archivo
en vez de estar escritas a mano. `linea_base.py` las recalcula y permite contrastarlas.

```bash
python ingesta/linea_base.py "ruta/al/EXTRACTO COM. NEGRAS 13.SEP.2026.xlsx" \
       --json ingesta/salidas/linea_base.json
```

El extracto **no está en el repo** y no debe estarlo: contiene datos personales de
ciudadanos y el repositorio es público. `ingesta/.gitignore` bloquea `.xlsx`, `.csv`,
`.json` y `salidas/`.

El script produce **solo agregados** —conteos, medianas, distribuciones—. No imprime ni
guarda contenido de celdas: el campo `ASUNTO` trae cuerpos de correo enteros con cédulas
y teléfonos, así que se usa para contar, nunca para volcar.

## Contraste con las cifras publicadas

Corte 2026-09-11, 43.216 registros.

| Cifra | En el código | Del extracto | |
|---|---:|---:|---|
| Pendientes totales | 10.388 | 10.388 | exacto |
| Atascados en mesa de entrada | 8.740 | 8.757 | 0,2 % |
| % del rezago en mesa | 84,1 % | 84,3 % | coincide |
| Resueltas fuera de término | 77 % | 77,8 % | coincide |
| Mediana, todas las PQRSDF | 102 | 94 | ver abajo |
| Mediana, trámite de registro | 49 | 55 | ver abajo |
| Antigüedad mediana de pendientes | 95 | 144 | ver abajo |

El volumen por año reproduce la fuente exactamente (2.831 / 8.339 / 9.843 / 11.776 /
10.427), lo que confirma que se está leyendo el mismo universo.

**Las medianas** difieren según qué se cuente como "resuelto" y qué tipologías entren en
"trámite de registro". Aquí se toman las cuatro tipologías de comunidades negras con
registro o actualización (10.139 casos) y se mide contra `FECHA TRAMITÓ`. La diferencia de
6 días sobre 49 no cambia el argumento, pero conviene fijar el criterio con la Dirección
antes de publicar la cifra.

**La antigüedad de 144 días** no contradice los 95 de la fuente: depende de contra qué
fecha se mida. Aquí se mide contra el corte del extracto (2026-09-11), no contra hoy,
porque el archivo es una foto y medirlo contra hoy infla el dato con el paso del tiempo.
Con 7.533 de los 10.388 pendientes radicados en 2026, la mediana es sensible al método.
**Es la cifra que más conviene revisar antes de presentarla.**

## Qué columna sirve y cuál engaña

Lo más importante que encontró el perfilado:

- **`FECHA RESPUESTA` no sirve para medir tiempos.** Nunca está vacía —trae valor en las
  43.216 filas, incluidas las 10.388 pendientes— y da mediana 0 días. Es la radicación del
  documento de salida. La fecha real de gestión es **`FECHA TRAMITÓ`**, y con ella el
  fuera de término da 77,8 %, que es la cifra de la fuente.
- **`FUNCIONARIO SIN INICIAR TRAMITE` = `DIRCOMUNIDADES NEGRAS DCN MESA DE ENTRADA`** es
  lo que marca un caso sin dueño: 8.757 de 10.388. No es un campo vacío, es un
  responsable que no es una persona.
- **`SERIE` viene partida por espacios finales**: `'DERECHOS DE PETICION'` (8.680) y
  `'DERECHOS DE PETICION '` (2.634) son la misma serie. Sin normalizar, cualquier conteo
  por serie sale mal.
- **`DÍAS CALENDARIO` es inservible** (62 negativos). Los días se recalculan de las fechas.
- **8 columnas están vacías al 100 %**, entre ellas `COMUNIDAD`, `NOMBRECOMUNIDAD`,
  `PERTENENCIAETNICA`, `EDAD`, `SEXO_NACIMIENTO` y `DISCAPACIDAD`.

## Lo que falta: el catálogo de comunidades

**No existe identificador de comunidad en ninguna columna.** Las que deberían tenerlo
están vacías. El nombre aparece dentro de `ASUNTO` en unas 6.763 filas, pero `ASUNTO` son
cuerpos de correo pegados —con direcciones, nombres de funcionarios y datos personales— y
340 superan los 500 caracteres.

Construir el catálogo exige extraer nombres de texto libre, conciliar variantes del mismo
consejo ("C.C. La Victoria" / "Consejo Comunitario de La Victoria") y **someter el
resultado a revisión humana** antes de cargarlo: el sistema propone, una persona confirma,
igual que el resto del diseño. No está hecho todavía.
