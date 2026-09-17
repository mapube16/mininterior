import { useNavigate } from 'react-router-dom'
import { SearchBar } from '../ds/index.js'
import Layout from '../components/Layout.jsx'
import { Tarjeta, Parrafo, Mudo, BotonLink } from '../components/ui.jsx'
import { R } from '../routes.js'

const SUGERENCIAS = [
  'Guapi, Cauca',
  'Bajo Baudó, Chocó',
  'Buenaventura, Valle del Cauca',
  'María la Baja, Bolívar',
  'Consejo Comunitario Playa Bonita del Baudó',
]

const GARANTIAS = [
  { color: 'var(--color-green)', d: 'M8.5 12.5l2.5 2.5 4.5-5', fuerte: 'El trámite no cuesta nada.', resto: ' Ni ahora ni después.' },
  { color: 'var(--color-cobalt)', d: 'M12 7.5V12l3 2', fuerte: 'Respuesta en 15 días hábiles', resto: ' desde que radicas.' },
  { color: 'var(--color-cobalt)', chat: true, fuerte: 'Te acompañamos en línea', resto: ' o por teléfono si lo necesitas.' },
]

export default function P1Inicio() {
  const navegar = useNavigate()
  const irAConsulta = (q) => navegar(q ? `${R.consulta}?q=${encodeURIComponent(q)}` : R.consulta)

  return (
    <Layout padding="56px 24px 72px">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 42, lineHeight: '50px', color: 'var(--text-title)', margin: 0, maxWidth: '20ch', textWrap: 'pretty' }}>
        Registro Público Único Nacional de comunidades negras, afrocolombianas, raizales y palenqueras
      </h1>
      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, lineHeight: '28px', color: 'var(--text-body)', margin: '16px 0 0', maxWidth: '62ch', textWrap: 'pretty' }}>
        Es el registro oficial del Estado donde quedan inscritos los consejos comunitarios, las organizaciones de base y
        las formas y expresiones organizativas de las comunidades NARP. Aquí puedes consultar esa información o hacer tu
        trámite en línea.
      </p>

      <div style={{ marginTop: 32, maxWidth: 760 }}>
        <SearchBar
          label="Busca una comunidad por nombre o municipio"
          placeholder="Busca una comunidad por nombre o municipio"
          buttonLabel="Buscar"
          suggestions={SUGERENCIAS}
          onSearch={irAConsulta}
        />
        <Mudo style={{ marginTop: 10 }}>Por ejemplo: Guapi, Bajo Baudó, consejo comunitario del Atrato.</Mudo>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 24, marginTop: 48 }}>
        <Camino
          acento="var(--color-cobalt)"
          titulo="Consultar comunidades"
          texto="Información pública de las comunidades registradas. No necesitas cuenta ni registro."
          accion="Consultar comunidades"
          href={R.consulta}
          icono={<><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></>}
        />
        <Camino
          acento="#D23C46"
          titulo="Hacer o seguir un trámite"
          texto="Avisa de un cambio en tu comunidad, registra una comunidad nueva o mira en qué va tu solicitud. Necesitas una cuenta."
          accion="Entrar o crear cuenta"
          href={R.ingreso}
          icono={<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h4" /></>}
        />
      </div>

      <div style={{ marginTop: 40, border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
        {GARANTIAS.map((g, i) => (
          <div key={g.fuerte} style={{ padding: '20px 24px', display: 'flex', gap: 12, alignItems: 'flex-start', ...(i > 0 ? { borderLeft: '1px solid var(--border-subtle)' } : null) }}>
            <span aria-hidden="true" style={{ color: g.color, marginTop: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {g.chat ? <path d="M4 5h16v11H12l-4 3v-3H4z" /> : <><circle cx="12" cy="12" r="9" /><path d={g.d} /></>}
              </svg>
            </span>
            <Parrafo><strong>{g.fuerte}</strong>{g.resto}</Parrafo>
          </div>
        ))}
      </div>
    </Layout>
  )
}

function Camino({ acento, titulo, texto, accion, href, icono }) {
  return (
    <Tarjeta acento={acento} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span aria-hidden="true" style={{ width: 44, height: 44, border: '1px solid var(--border-subtle)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: acento }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{icono}</svg>
      </span>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 26, lineHeight: '34px', color: 'var(--text-title)', margin: 0 }}>{titulo}</h2>
      <Parrafo style={{ flex: 1 }}>{texto}</Parrafo>
      <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
        <BotonLink to={href}>{accion}</BotonLink>
      </div>
    </Tarjeta>
  )
}
