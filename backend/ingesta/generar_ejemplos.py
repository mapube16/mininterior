"""Genera los documentos de ejemplo para probar la carga de archivos.

Todo el contenido es FICTICIO: comunidades, personas y documentos inventados, como
exige el contexto del proyecto. Sirven para tener un PDF real que subir en el
asistente de radicación, no para acreditar nada.

Uso:
    python ingesta/generar_ejemplos.py [carpeta-destino]
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors

DESTINO = Path(sys.argv[1] if len(sys.argv) > 1 else "docs/ejemplos")

_base = getSampleStyleSheet()
TITULO = ParagraphStyle("t", parent=_base["Title"], fontSize=14, leading=18, spaceAfter=4)
SUBTITULO = ParagraphStyle("s", parent=_base["Normal"], fontSize=11, leading=15,
                           alignment=TA_CENTER, spaceAfter=14)
CUERPO = ParagraphStyle("c", parent=_base["Normal"], fontSize=10, leading=14,
                        alignment=TA_JUSTIFY, spaceAfter=6)
SECCION = ParagraphStyle("h", parent=_base["Normal"], fontSize=10.5, leading=13,
                         spaceBefore=7, spaceAfter=4, fontName="Helvetica-Bold")
NOTA = ParagraphStyle("n", parent=_base["Normal"], fontSize=8, leading=11,
                      textColor=colors.HexColor("#7E7E7E"), alignment=TA_CENTER)

AVISO = (
    "DOCUMENTO DE PRUEBA — contenido ficticio, generado para ensayar el portal RUPN NARP. "
    "No acredita ningún hecho ni sustituye un documento real."
)


def _firmas(bloques: list[str]) -> Table:
    """Bloque de firmas: sin rejilla, que en un acta se ve como un formulario."""
    t = Table([bloques], colWidths=[7.5 * cm] * len(bloques))
    t.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    return t


def _doc(nombre: str) -> SimpleDocTemplate:
    DESTINO.mkdir(parents=True, exist_ok=True)
    return SimpleDocTemplate(
        str(DESTINO / nombre), pagesize=LETTER,
        leftMargin=2.5 * cm, rightMargin=2.5 * cm,
        topMargin=1.8 * cm, bottomMargin=1.8 * cm,
        title=nombre.replace(".pdf", ""), author="Ejemplo de prueba",
    )


def _tabla(filas: list[list[str]], anchos: list[float]) -> Table:
    t = Table(filas, colWidths=anchos)
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5ECF8")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D4D4D4")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def acta_asamblea() -> str:
    """Acta de elección de representante legal: el documento del caso protagonista."""
    d = _doc("acta-asamblea-ejemplo.pdf")
    h = [
        Paragraph("CONSEJO COMUNITARIO GUAPI ABAJO UNIDOS", TITULO),
        Paragraph("Guapi, Cauca · Acta 004 de 2026", SUBTITULO),
        Paragraph("ACTA DE ASAMBLEA GENERAL PARA LA ELECCIÓN DE REPRESENTANTE LEGAL", SECCION),
        Paragraph(
            "En el municipio de Guapi, departamento del Cauca, a los quince (15) días del mes de "
            "agosto de dos mil veintiséis (2026), siendo las nueve de la mañana (9:00 a.m.), se "
            "reunió la Asamblea General del Consejo Comunitario Guapi Abajo Unidos, en la casa "
            "comunal de la vereda, previa convocatoria realizada con quince (15) días de antelación.",
            CUERPO),
        Paragraph("PRIMERO. VERIFICACIÓN DEL QUÓRUM", SECCION),
        Paragraph(
            "Se verificó la asistencia de ciento cuarenta y dos (142) miembros de la comunidad, de "
            "un total de doscientos diez (210) censados, equivalente al 67,6 %, con lo cual se "
            "constituye quórum deliberatorio y decisorio conforme a los estatutos.",
            CUERPO),
        Paragraph("SEGUNDO. ELECCIÓN DE REPRESENTANTE LEGAL", SECCION),
        Paragraph(
            "Puesta en consideración la postulación de la señora ROSALBA MOSQUERA, identificada con "
            "cédula de ciudadanía número 1.061.700.000 expedida en Guapi, la Asamblea procedió a "
            "votación, con el siguiente resultado:",
            CUERPO),
        Spacer(1, 4),
        _tabla(
            [["Concepto", "Votos", "Porcentaje"],
             ["A favor", "128", "90,1 %"],
             ["En contra", "9", "6,3 %"],
             ["En blanco", "5", "3,6 %"],
             ["Total votantes", "142", "100 %"]],
            [7 * cm, 3.5 * cm, 3.5 * cm]),
        Spacer(1, 10),
        Paragraph(
            "En consecuencia, la Asamblea General DECLARA ELECTA a la señora ROSALBA MOSQUERA como "
            "Representante Legal del Consejo Comunitario Guapi Abajo Unidos, por un período de tres "
            "(3) años contados a partir de la fecha de la presente acta.",
            CUERPO),
        Paragraph("TERCERO. AUTORIZACIÓN PARA EL TRÁMITE DE REGISTRO", SECCION),
        Paragraph(
            "La Asamblea autoriza a la representante electa para adelantar ante el Ministerio del "
            "Interior el trámite de actualización del Registro Público Único Nacional.",
            CUERPO),
        Paragraph(
            "No siendo otro el objeto de la reunión, se levanta la sesión siendo las doce del "
            "mediodía (12:00 m.) y se firma por quienes en ella intervinieron.",
            CUERPO),
        Spacer(1, 10),
        _firmas([
            "_____________________________\nPresidente de la Asamblea\nEuclides Caicedo Angulo\nC.C. 1.061.700.101",
            "_____________________________\nSecretario de la Asamblea\nNorberto Riascos Grueso\nC.C. 1.061.700.102",
        ]),
        Spacer(1, 18),
        Paragraph(AVISO, NOTA),
    ]
    d.build(h)
    return d.filename


def listado_censal() -> str:
    """Listado censal: los totales cuadran, para que la validación pase."""
    d = _doc("listado-censal-ejemplo.pdf")

    filas = [["N.º", "Nombre", "Documento", "Edad", "Parentesco"]]
    personas = [
        ("Rosalba Mosquera", "1.061.700.000", "47", "Jefa de hogar"),
        ("Euclides Caicedo Angulo", "1.061.700.101", "52", "Jefe de hogar"),
        ("Norberto Riascos Grueso", "1.061.700.102", "39", "Jefe de hogar"),
        ("Yolanda Angulo Mina", "1.061.700.103", "44", "Jefa de hogar"),
        ("Ceferino Obregón Solís", "1.061.700.104", "61", "Jefe de hogar"),
        ("Marleny Carabalí Viveros", "1.061.700.105", "35", "Jefa de hogar"),
        ("Aristóbulo Sinisterra Paz", "1.061.700.106", "58", "Jefe de hogar"),
        ("Digna Valencia Moreno", "1.061.700.107", "29", "Jefa de hogar"),
    ]
    for i, (n, doc, edad, par) in enumerate(personas, 1):
        filas.append([str(i), n, doc, edad, par])

    h = [
        Paragraph("CONSEJO COMUNITARIO GUAPI ABAJO UNIDOS", TITULO),
        Paragraph("Listado censal de integrantes · corte 1 de septiembre de 2026", SUBTITULO),
        Paragraph(
            "El presente listado relaciona los integrantes censados del Consejo Comunitario. "
            "Se incluye una muestra de los jefes de hogar; el consolidado por sexo aparece al final.",
            CUERPO),
        Spacer(1, 6),
        _tabla(filas, [1.2 * cm, 6 * cm, 3.4 * cm, 1.6 * cm, 3 * cm]),
        Spacer(1, 14),
        Paragraph("CONSOLIDADO", SECCION),
        _tabla(
            [["Concepto", "Personas"],
             ["Hombres", "104"],
             ["Mujeres", "106"],
             ["Total censado", "210"],
             ["Número de hogares", "58"]],
            [9 * cm, 5 * cm]),
        Spacer(1, 10),
        Paragraph(
            "Los totales por sexo suman el total censado, condición que verifica el sistema al "
            "radicar la actualización del censo.",
            CUERPO),
        Spacer(1, 20),
        _firmas([
            "_____________________________\nRepresentante Legal\nRosalba Mosquera\nC.C. 1.061.700.000",
            "_____________________________\nSecretario\nNorberto Riascos Grueso\nC.C. 1.061.700.102",
        ]),
        Spacer(1, 18),
        Paragraph(AVISO, NOTA),
    ]
    d.build(h)
    return d.filename


def documento_identidad() -> str:
    """Sustituto del documento de identidad: nunca una cédula real, ni de prueba."""
    d = _doc("documento-identidad-ejemplo.pdf")
    h = [
        Paragraph("DOCUMENTO DE IDENTIDAD — SUSTITUTO DE PRUEBA", TITULO),
        Spacer(1, 6),
        Paragraph(
            "Este archivo ocupa el lugar de la copia del documento de identidad en el ensayo del "
            "portal. No reproduce una cédula real ni su formato, a propósito: el sistema maneja "
            "datos de identificación como información restringida.",
            CUERPO),
        Spacer(1, 10),
        _tabla(
            [["Campo", "Valor de prueba"],
             ["Nombre", "Rosalba Mosquera"],
             ["Tipo de documento", "Cédula de ciudadanía"],
             ["Número", "1.061.700.000"],
             ["Lugar de expedición", "Guapi, Cauca"],
             ["Rol en el trámite", "Representante legal electa"]],
            [6 * cm, 9 * cm]),
        Spacer(1, 20),
        Paragraph(AVISO, NOTA),
    ]
    d.build(h)
    return d.filename


if __name__ == "__main__":
    for generar in (acta_asamblea, listado_censal, documento_identidad):
        print("  generado:", generar())
