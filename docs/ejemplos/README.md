# Documentos de ejemplo

PDF ficticios para probar la carga de archivos en el asistente de radicación.

| Archivo | Trámite | Qué contiene |
|---|---|---|
| `acta-asamblea-ejemplo.pdf` | Cambio de representante, junta directiva, linderos | Acta con quórum, votación y firmas |
| `documento-identidad-ejemplo.pdf` | Cambio de representante legal | Sustituto de la copia del documento |
| `listado-censal-ejemplo.pdf` | Actualización del censo | Listado con los totales cuadrados |

**Todo el contenido es inventado.** Comunidad, personas y números no corresponden a
nadie real, y cada documento lo dice al pie. No reproducen el formato de una cédula a
propósito: el sistema trata la identificación como dato restringido.

Los totales del listado censal (104 hombres + 106 mujeres = 210) **cuadran a propósito**:
así pasa la validación. Si se cambia uno de los tres, el sistema rechaza la radicación
con "los totales del censo no cuadran", que sirve para enseñar la validación en origen.

Se regeneran con:

```bash
python backend/ingesta/generar_ejemplos.py docs/ejemplos
```
