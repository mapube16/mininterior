import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Button, SearchBar, Select } from '../ds/index.js'
import Layout, { Migas } from '../components/Layout.jsx'
import MapaConsulta from '../components/MapaConsulta.jsx'
import { Estado, Mudo, Parrafo } from '../components/ui.jsx'
import { COMUNIDADES, DEPARTAMENTOS, TIPOS_ORGANIZACION, ESTADOS } from '../mock/datos.js'
import { R, ruta } from '../routes.js'

const TODOS = 'Todos'
const ESTADOS_REGISTRO = ['Vigente', 'En actualización', 'Pendiente', 'Requiere acción']

export default function P2Consulta() {
  const [params] = useSearchParams()
  const [texto, setTexto] = useState(params.get('q') ?? '')
  const [departamento, setDepartamento] = useState(TODOS)
  const [municipio, setMunicipio] = useState(TODOS)
  const [tipo, setTipo] = useState(TODOS)
  const [estado, setEstado] = useState(TODOS)
  const [agrupado, setAgrupado] = useState(true)
  const [hoverId, setHoverId] = useState(null)
  const [mapaOk, setMapaOk] = useState(true) // el prototipo modela una falla real de la capa de mapas

  const municipios = useMemo(() => {
    const base = departamento === TODOS ? COMUNIDADES : COMUNIDADES.filter((c) => c.departamento === departamento)
    return [...new Set(base.map((c) => c.municipio))].sort()
  }, [departamento])

  const resultados = useMemo(() => {
    const q = texto.trim().toLowerCase()
    return COMUNIDADES.filter((c) => {
      if (q && !`${c.nombre} ${c.municipio} ${c.departamento}`.toLowerCase().includes(q)) return false
      if (departamento !== TODOS && c.departamento !== departamento) return false
      if (municipio !== TODOS && c.municipio !== municipio) return false
      if (tipo !== TODOS && c.tipo !== tipo) return false
      if (estado !== TODOS && c.estado !== estado) return false
      return true
    })
  }, [texto, departamento, municipio, tipo, estado])

  const limpiar = () => {
    setTexto('')
    setDepartamento(TODOS)
    setMunicipio(TODOS)
    setTipo(TODOS)
    setEstado(TODOS)
  }

  const cambiarDepartamento = (v) => {
    setDepartamento(v)
    setMunicipio(TODOS) // el municipio elegido puede no existir en el nuevo departamento
  }

  return (
    <Layout ancho={1320} padding="0">
      <div style={{ padding: '24px 24px 64px' }}>
        <Migas items={[{ label: 'Inicio', href: R.inicio }, { label: 'Consultar comunidades' }]} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 34, lineHeight: '42px', color: 'var(--text-title)', margin: '12px 0 4px' }}>
          Consultar comunidades
        </h1>
        <Parrafo style={{ margin: '0 0 20px', maxWidth: '70ch' }}>
          Información pública de las comunidades inscritas en el registro. No necesitas cuenta para consultar.
        </Parrafo>

        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 20, background: 'var(--surface-card)' }}>
          <SearchBar
            label="Busca una comunidad por nombre o municipio"
            placeholder="Busca una comunidad por nombre o municipio"
            buttonLabel="Buscar"
            value={texto}
            onChange={setTexto}
            onSearch={setTexto}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16, marginTop: 16 }}>
            <Select label="Departamento" placeholder={TODOS} options={[TODOS, ...DEPARTAMENTOS]} value={departamento} onChange={cambiarDepartamento} />
            <Select label="Municipio" placeholder={TODOS} options={[TODOS, ...municipios]} value={municipio} onChange={setMunicipio} />
            <Select label="Tipo de organización" placeholder={TODOS} options={[TODOS, ...TIPOS_ORGANIZACION]} value={tipo} onChange={setTipo} />
            <Select label="Estado del registro" placeholder={TODOS} options={[TODOS, ...ESTADOS_REGISTRO]} value={estado} onChange={setEstado} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            <Parrafo style={{ fontSize: 14, lineHeight: '22px' }}>
              {resultados.length === COMUNIDADES.length
                ? `${resultados.length} comunidades registradas`
                : `${resultados.length} de ${COMUNIDADES.length} comunidades`}
            </Parrafo>
            <button
              type="button"
              onClick={limpiar}
              style={{ minHeight: 36, padding: '0 4px', border: 0, background: 'none', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-link)', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Quitar todos los filtros
            </button>
            <button
              type="button"
              onClick={() => setMapaOk((v) => !v)}
              style={{ minHeight: 36, padding: '0 14px', marginLeft: 'auto', border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-body)', cursor: 'pointer' }}
            >
              {mapaOk ? 'Simular mapa caído' : 'Restablecer el mapa'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,2fr) minmax(320px,3fr)', gap: 24, marginTop: 24, alignItems: 'start' }}>
          <div>
            {resultados.length > 0 ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {resultados.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={ruta(R.comunidad, { id: c.id })}
                      onMouseEnter={() => setHoverId(c.id)}
                      onMouseLeave={() => setHoverId(null)}
                      onFocus={() => setHoverId(c.id)}
                      onBlur={() => setHoverId(null)}
                      style={{
                        display: 'block', padding: 16, borderRadius: 8, textDecoration: 'none', background: 'var(--surface-card)',
                        border: `1px solid ${hoverId === c.id ? 'var(--color-cobalt)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ flex: 1, minWidth: 0, display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: '26px', color: 'var(--text-title)' }}>
                          {c.nombre}
                        </span>
                        <Estado estado={c.estado} />
                      </span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', marginTop: 6 }}>
                        {c.tipo}
                      </span>
                      <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', marginTop: 2 }}>
                        <span aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
                            <circle cx="12" cy="10" r="2.4" />
                          </svg>
                        </span>
                        {c.municipio}, {c.departamento}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-notice)', padding: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '26px', color: 'var(--text-title)', margin: 0 }}>
                  No encontramos comunidades con esos filtros
                </h2>
                <Parrafo>
                  Prueba con el nombre del municipio en vez del nombre de la comunidad, revisa si el departamento y el
                  municipio corresponden, o quita el filtro de estado del registro.
                </Parrafo>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
                  <Button variant="filled" onClick={limpiar}>Quitar los filtros</Button>
                  <Button variant="outline" href="#ayuda">Pedir ayuda para buscar</Button>
                </div>
              </div>
            )}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-muted)', margin: '16px 0 0' }}>
              El registro público muestra únicamente nombre, tipo de organización, municipio, departamento y estado. No
              publicamos nombres de dirigentes, direcciones, teléfonos ni coordenadas exactas.
            </p>
          </div>

          <div style={{ position: 'sticky', top: 24 }}>
            {mapaOk ? (
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <Mudo style={{ fontSize: 12, lineHeight: '20px' }}>Mapa con datos abiertos de OpenStreetMap</Mudo>
                  <button
                    type="button"
                    onClick={() => setAgrupado((v) => !v)}
                    style={{ minHeight: 36, padding: '0 14px', border: '1px solid var(--border-subtle)', borderRadius: 6, background: 'var(--surface-card)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-body)', cursor: 'pointer' }}
                  >
                    {agrupado ? 'Ver una marca por comunidad' : 'Agrupar por municipio'}
                  </button>
                </div>
                <MapaConsulta comunidades={resultados} agrupado={agrupado} hoverId={hoverId} onHover={setHoverId} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-subtle)' }}>
                  <Mudo style={{ fontSize: 12, lineHeight: '20px' }}>
                    {agrupado ? 'Cada marca reúne las comunidades de un municipio.' : 'El color indica el estado del registro.'}
                  </Mudo>
                  {!agrupado &&
                    ESTADOS_REGISTRO.map((e) => (
                      <span key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '20px', color: 'var(--text-body)' }}>
                        <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: '50%', background: ESTADOS[e].color, display: 'inline-block' }} />
                        {e}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border-subtle)', borderLeft: '4px solid var(--color-yellow)', borderRadius: 8, background: 'var(--surface-notice)', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span aria-hidden="true" style={{ color: 'var(--color-golden-brown)', marginTop: 2 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 4l8.5 15H3.5z" />
                    <path d="M12 10v4M12 16.5v.5" />
                  </svg>
                </span>
                <Parrafo style={{ fontSize: 14, lineHeight: '22px' }}>
                  No pudimos cargar el mapa con tu conexión. La lista de resultados sigue funcionando completa. Puedes
                  volver a intentarlo más tarde.
                </Parrafo>
              </div>
            )}
          </div>
        </div>

        <p id="ayuda" style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-body)', margin: '32px 0 0' }}>
          ¿No encuentras tu comunidad? Llámanos gratis al 01 8000 000 000 o <Link to={R.ingreso}>entra a tu cuenta</Link> para
          avisar de un cambio.
        </p>
      </div>
    </Layout>
  )
}
