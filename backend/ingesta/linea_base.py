"""Calcula la línea base real a partir del extracto del SGDEA.

Para qué: las cifras que el sistema muestra en `/api/metricas/simulacion` (49 días de
mediana, 77 % fuera de término, 8.740 casos atascados) son el argumento del proyecto.
Este script las deriva del archivo para que sean **reproducibles y defendibles**, en vez
de estar escritas a mano en el código.

Privacidad: solo produce agregados —conteos, medianas, distribuciones—. No escribe ni
imprime contenido de celdas con datos personales. El extracto lleva cédulas y teléfonos
en los cuerpos de correo de ASUNTO, así que ese campo solo se usa para contar, nunca
para volcar.

Uso:
    python ingesta/linea_base.py "ruta/al/EXTRACTO.xlsx" [--json salidas/linea_base.json]
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("Falta openpyxl. Instálalo con: pip install openpyxl")


# El extracto trae la misma serie escrita con y sin espacios finales, así que
# cualquier agrupación sin normalizar parte los conteos en dos.
def normalizar(v) -> str:
    return " ".join(str(v).split()).upper() if v is not None else ""


# Tipologías que corresponden al trámite de registro/actualización, que es el que
# mide el proyecto. El resto de PQRSDF tiene una mediana muy distinta.
def es_tramite_registro(tipologia: str) -> bool:
    t = normalizar(tipologia)
    return "COMUNIDADES NEGRAS" in t and ("REGISTRO" in t or "ACTUALIZACI" in t)


# Rutas especiales: no siguen el flujo estándar y tienen términos propios (§6.2).
RUTAS = {
    "tutela": ("ACCION DE TUTELA", "ACCIÓN DE TUTELA", "TUTELA"),
    "demanda_contencioso": ("DEMANDA", "PROCESO JUDICIAL"),
    "ente_control": ("ENTE DE CONTROL",),
    "consulta_previa": ("CONSULTA PREVIA",),
    "cumplimiento": ("ACCION DE CUMPLIMIENTO", "ACCIÓN DE CUMPLIMIENTO"),
}

SIN_INICIAR = "SIN INICIAR TRAMITE"
MESA_ENTRADA = "MESA DE ENTRADA"


def fecha(valor):
    if isinstance(valor, datetime):
        return valor
    if isinstance(valor, str) and valor.strip():
        for formato in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y"):
            try:
                return datetime.strptime(valor.strip()[:19], formato)
            except ValueError:
                continue
    return None


def analizar(ruta: Path) -> dict:
    wb = openpyxl.load_workbook(ruta, read_only=True, data_only=True)
    hoja = wb["BD"] if "BD" in wb.sheetnames else wb[wb.sheetnames[0]]
    filas = hoja.iter_rows(values_only=True)
    cols = {c: i for i, c in enumerate(next(filas))}

    def campo(fila, nombre, defecto=None):
        i = cols.get(nombre)
        return fila[i] if i is not None else defecto

    total = 0
    por_anio = Counter()
    respondidas_anio = Counter()
    pendientes_anio = Counter()
    tipologias = Counter()
    medios = Counter()
    series = Counter()

    pendientes = 0
    pendientes_en_mesa = 0
    pendientes_con_asesor = 0
    antiguedad_pendientes: list[int] = []
    radicacion_pendientes: list[datetime] = []

    dias_resolucion_todas: list[int] = []
    dias_resolucion_registro: list[int] = []
    fuera_de_termino = 0
    con_termino = 0

    registro_total = 0
    registro_atascado = 0
    rutas_especiales = Counter()
    rutas_atascadas = Counter()

    corte = None

    for fila in filas:
        total += 1

        f_rad = fecha(campo(fila, "FECHA RADICACIÓN")) or fecha(campo(fila, "FECHA CREACIÓN"))
        # FECHA TRAMITÓ es cuando se gestionó el caso. FECHA RESPUESTA es la
        # radicación del documento de salida y da mediana 0: no sirve para medir
        # cuánto tarda el trámite, aunque el nombre sugiera lo contrario.
        f_resp = fecha(campo(fila, "FECHA TRAMITÓ"))
        f_venc = fecha(campo(fila, "FECHA VENCIMIENTO"))

        if f_rad:
            por_anio[f_rad.year] += 1
            corte = max(corte, f_rad) if corte else f_rad

        estado = normalizar(campo(fila, "ESTADO TRAMITE"))
        tipologia = campo(fila, "TIPOLOGÍA DOCUMENTAL") or ""
        oficina_sin_iniciar = normalizar(campo(fila, "OFICINA SIN INICIAR TRAMITE"))
        funcionario_sin_iniciar = normalizar(campo(fila, "FUNCIONARIO SIN INICIAR TRAMITE"))

        tipologias[normalizar(tipologia)] += 1
        medios[normalizar(campo(fila, "MEDIO RECEPCIÓN"))] += 1
        series[normalizar(campo(fila, "SERIE"))] += 1

        es_registro = es_tramite_registro(tipologia)
        if es_registro:
            registro_total += 1

        ruta_especial = None
        t_norm = normalizar(tipologia)
        for nombre, claves in RUTAS.items():
            if any(c in t_norm for c in claves):
                ruta_especial = nombre
                rutas_especiales[nombre] += 1
                break

        resuelto = estado != SIN_INICIAR

        if resuelto:
            if f_rad:
                respondidas_anio[f_rad.year] += 1
            # Días calendario entre radicación y gestión. La columna DÍAS CALENDARIO
            # del extracto trae negativos hasta -46.146, así que se recalcula.
            if f_rad and f_resp and f_resp >= f_rad:
                dias = (f_resp - f_rad).days
                dias_resolucion_todas.append(dias)
                if es_registro:
                    dias_resolucion_registro.append(dias)
            if f_venc and f_resp:
                con_termino += 1
                if f_resp > f_venc:
                    fuera_de_termino += 1
        else:
            pendientes += 1
            if f_rad:
                pendientes_anio[f_rad.year] += 1
                radicacion_pendientes.append(f_rad)
            # "Sin dueño" = el responsable no es una persona sino la mesa de entrada.
            # Es el hallazgo central del análisis: el caso está radicado, pero nadie
            # con nombre propio lo tiene. Ahí se acumula el 84 % del rezago.
            en_mesa = MESA_ENTRADA in funcionario_sin_iniciar or not funcionario_sin_iniciar
            if en_mesa:
                pendientes_en_mesa += 1
            else:
                pendientes_con_asesor += 1
            if es_registro:
                registro_atascado += 1
            if ruta_especial:
                rutas_atascadas[ruta_especial] += 1

    wb.close()

    # La antigüedad se mide contra la fecha de corte del extracto, no contra hoy:
    # el archivo es una foto y medirla contra hoy la infla con el paso del tiempo.
    # El corte solo se conoce al terminar de leer, así que se aplica aquí sobre las
    # fechas ya recogidas, en vez de releer el archivo entero.
    if corte:
        antiguedad_pendientes = [(corte - f).days for f in radicacion_pendientes if f <= corte]

    def mediana(xs):
        return round(statistics.median(xs)) if xs else None

    pct = lambda n, d: round(n / d * 100, 1) if d else 0.0

    return {
        "fuente": ruta.name,
        "corte": corte.date().isoformat() if corte else None,
        "total_registros": total,
        "volumen_por_anio": {
            str(a): {
                "recibidas": por_anio[a],
                "respondidas": respondidas_anio[a],
                "pendientes": pendientes_anio[a],
            }
            for a in sorted(por_anio)
        },
        "pendientes": {
            "total": pendientes,
            "en_mesa_de_entrada": pendientes_en_mesa,
            "pct_en_mesa": pct(pendientes_en_mesa, pendientes),
            "con_responsable": pendientes_con_asesor,
            "antiguedad_mediana_dias": mediana(antiguedad_pendientes),
            "antiguedad_maxima_dias": max(antiguedad_pendientes) if antiguedad_pendientes else None,
        },
        "tiempos": {
            "mediana_todas_pqrsdf": mediana(dias_resolucion_todas),
            "mediana_tramite_registro": mediana(dias_resolucion_registro),
            "n_resueltas_medidas": len(dias_resolucion_todas),
            "n_registro_medidas": len(dias_resolucion_registro),
            "fuera_de_termino_pct": pct(fuera_de_termino, con_termino),
            "n_con_termino": con_termino,
        },
        "tramite_registro": {
            "total": registro_total,
            "pct_del_universo": pct(registro_total, total),
            "atascados": registro_atascado,
            "promedio_anual": round(registro_total / max(len(por_anio), 1)),
        },
        "rutas_especiales": {
            k: {"total": v, "atascados": rutas_atascadas.get(k, 0)}
            for k, v in rutas_especiales.most_common()
        },
        "canales": {k: v for k, v in medios.most_common(8) if k},
        "tipologias_top": dict(tipologias.most_common(12)),
        "series_normalizadas": len([s for s in series if s]),
    }


def imprimir(d: dict) -> None:
    p, t, r = d["pendientes"], d["tiempos"], d["tramite_registro"]
    print(f"\nFUENTE: {d['fuente']}  ·  corte {d['corte']}  ·  {d['total_registros']:,} registros\n")

    print("VOLUMEN POR AÑO")
    print(f"  {'año':<6}{'recibidas':>11}{'respondidas':>13}{'pendientes':>12}")
    for anio, v in d["volumen_por_anio"].items():
        print(f"  {anio:<6}{v['recibidas']:>11,}{v['respondidas']:>13,}{v['pendientes']:>12,}")

    print(f"\nREZAGO: {p['total']:,} pendientes")
    print(f"  en mesa de entrada, sin responsable: {p['en_mesa_de_entrada']:,} ({p['pct_en_mesa']} %)")
    print(f"  con responsable asignado:            {p['con_responsable']:,}")
    print(f"  antigüedad mediana: {p['antiguedad_mediana_dias']} días  ·  máxima: {p['antiguedad_maxima_dias']} días")

    print("\nTIEMPOS")
    print(f"  mediana, todas las PQRSDF:        {t['mediana_todas_pqrsdf']} días  (n={t['n_resueltas_medidas']:,})")
    print(f"  mediana, trámite de registro:     {t['mediana_tramite_registro']} días  (n={t['n_registro_medidas']:,})")
    print(f"  resueltas fuera de término:       {t['fuera_de_termino_pct']} %  (n={t['n_con_termino']:,})")

    print(f"\nTRÁMITE DE REGISTRO: {r['total']:,} ({r['pct_del_universo']} % del universo)")
    print(f"  atascados: {r['atascados']:,}  ·  promedio anual: {r['promedio_anual']:,}")

    print("\nRUTAS ESPECIALES (no deberían entrar al flujo estándar)")
    for k, v in d["rutas_especiales"].items():
        print(f"  {k:<22}{v['total']:>7,} casos, {v['atascados']:>6,} atascados")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("extracto", type=Path)
    ap.add_argument("--json", type=Path, help="Guarda el resultado como JSON")
    args = ap.parse_args()

    if not args.extracto.exists():
        sys.exit(f"No encontré el archivo: {args.extracto}")

    datos = analizar(args.extracto)
    imprimir(datos)

    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(datos, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\nJSON: {args.json}")


if __name__ == "__main__":
    main()
