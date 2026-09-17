import { useState } from 'react'
import { Select } from '../ds/index.js'
import Layout from '../components/Layout.jsx'

// Registro INMUTABLE: esta pantalla solo filtra y lee. No hay editar ni borrar.
const EVENTOS = [
  { cuando: '27 ago, 4:02 p.m.', texto: 'Marta Rincón firmó la resolución 4187.', usuario: 'Marta Rincón', caso: 'RUPN-2026-004871', tipo: 'Decisión humana', restringido: false },
  { cuando: '27 ago, 10:15 a.m.', texto: 'Elena Vargas aprobó la proyección y la envió a firma.', usuario: 'Elena Vargas', caso: 'RUPN-2026-004871', tipo: 'Decisión humana', restringido: false },
  { cuando: '20 ago, 9:40 a.m.', texto: 'Daniel Perea justificó por escrito un hallazgo de pre-revisión.', usuario: 'Daniel Perea', caso: 'RUPN-2026-004871', tipo: 'Decisión humana', restringido: false },
  { cuando: '18 ago, 3:12 p.m.', texto: "El sistema propuso la categoría 'Cambio de representante legal' (confianza no expuesta).", usuario: 'sistema', caso: 'RUPN-2026-004871', tipo: 'Salida del sistema', restringido: false },
  { cuando: '16 ago, 11:50 a.m.', texto: 'Se consultó el documento de identidad del nuevo representante.', usuario: 'Daniel Perea', caso: 'RUPN-2026-004871', tipo: 'Acceso a dato restringido', restringido: true },
  { cuando: '12 ago, 10:24 a.m.', texto: 'Rosalba Mosquera radicó la solicitud.', usuario: 'Rosalba Mosquera (ciudadana)', caso: 'RUPN-2026-004871', tipo: 'Decisión humana', restringido: false },
]

const TODOS = 'Todos'
const CASOS_AUDITADOS = [...new Set(EVENTOS.map((e) => e.caso))]
const TIPOS_EVENTO = ['Decisión humana', 'Salida del sistema', 'Acceso a dato restringido']

export default function P33Auditoria() {
  const [caso, setCaso] = useState(TODOS)
  const [tipo, setTipo] = useState(TODOS)

  const eventos = EVENTOS.filter((e) => (caso === TODOS || e.caso === caso) && (tipo === TODOS || e.tipo === tipo))

  return (
    <Layout backoffice ancho={1280} padding="24px 24px 64px">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '0 0 20px' }}>
        Sesión de <strong>Iván Cárdenas</strong> · Administrador técnico · Dirección de Asuntos NARP
      </p>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: 0 }}>
        Auditoría
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '8px 0 0', maxWidth: '70ch' }}>
        Registro inmutable de eventos: qué sugirió el sistema, qué decidió la persona, qué se justificó.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 220 }}>
          <Select label="Caso" placeholder={TODOS} options={[TODOS, ...CASOS_AUDITADOS]} value={caso} onChange={setCaso} />
        </div>
        <div style={{ width: 220 }}>
          <Select label="Tipo de evento" placeholder={TODOS} options={[TODOS, ...TIPOS_EVENTO]} value={tipo} onChange={setTipo} />
        </div>
      </div>

      <section style={{ marginTop: 16, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {eventos.map((e, i) => (
            <li
              key={`${e.cuando}-${e.texto}`}
              style={{
                display: 'flex', gap: 16, alignItems: 'flex-start', padding: '14px 20px',
                ...(i < eventos.length - 1 ? { borderBottom: '1px solid var(--border-subtle)' } : null),
              }}
            >
              <span style={{ flex: 'none', width: 150, fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)' }}>
                {e.cuando}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '22px', color: 'var(--text-title)' }}>
                  {e.texto}
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)', marginTop: 2 }}>
                  {e.usuario} · {e.caso}
                </span>
              </div>
              {e.restringido && (
                <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', background: '#FBE9EC', color: '#A80521', border: '1px solid #A80521', borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '18px', whiteSpace: 'nowrap' }}>
                  Dato restringido
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
