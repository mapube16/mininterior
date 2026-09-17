import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ds/index.js'
import { ESTADOS } from '../mock/datos.js'

/**
 * Botón del kit que navega por el router.
 * El `href` del Button del kit renderiza un <a> plano y recarga toda la SPA.
 * ponytail: intercepta el click en vez de reimplementar el botón; si el kit acepta
 * un `as` en el futuro, esto se reemplaza por eso.
 */
export function BotonLink({ to, children, ...rest }) {
  const navegar = useNavigate()
  return (
    <Button
      href={to}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return // abrir en pestaña nueva
        e.preventDefault()
        navegar(to)
      }}
      {...rest}
    >
      {children}
    </Button>
  )
}

/** Insignia de estado: color + símbolo, nunca color solo (requisito de accesibilidad del kit). */
export function Estado({ estado, size = 14 }) {
  const e = ESTADOS[estado] ?? ESTADOS['Pendiente']
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
        padding: '4px 10px', borderRadius: 999, background: e.fondo, color: e.color,
        fontFamily: 'var(--font-body)', fontSize: size, lineHeight: '20px', fontWeight: 700,
      }}
    >
      <span aria-hidden="true">{e.glifo}</span>
      {estado}
    </span>
  )
}

/** Aviso: borde izquierdo 4px del color del estado, fondo del estado, ícono en círculo relleno. */
export function Aviso({ tono = 'info', titulo, children, acciones = null }) {
  const tonos = {
    info: { color: '#0943B5', fondo: '#E5ECF8', glifo: 'i' },
    aviso: { color: '#9D7700', fondo: '#FFFAE8', glifo: '!' },
    error: { color: '#A80521', fondo: '#FBE9EC', glifo: '!' },
    exito: { color: '#158361', fondo: '#E6F3EE', glifo: '✓' },
  }
  const t = tonos[tono] ?? tonos.info
  return (
    <div style={{ display: 'flex', gap: 12, padding: '16px 20px', background: t.fondo, borderLeft: `4px solid ${t.color}`, borderRadius: 4 }}>
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: t.color, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, marginTop: 1,
        }}
      >
        {t.glifo}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {titulo && (
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, lineHeight: '24px', color: 'var(--text-title)', margin: 0 }}>
            {titulo}
          </p>
        )}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: '23px', color: 'var(--text-body)', marginTop: titulo ? 4 : 0 }}>
          {children}
        </div>
        {acciones && <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>{acciones}</div>}
      </div>
    </div>
  )
}

export function Tarjeta({ children, style, acento = null, ...rest }) {
  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)',
        padding: 24, ...(acento ? { borderTop: `4px solid ${acento}` } : null), ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export function Titulo({ children, sub = null, nivel: N = 'h1' }) {
  const tamanos = { h1: [34, '42px'], h2: [26, '34px'], h3: [20, '28px'] }
  const [size, line] = tamanos[N] ?? tamanos.h2
  return (
    <>
      <N style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: size, lineHeight: line, color: 'var(--text-title)', margin: 0, textWrap: 'pretty' }}>
        {children}
      </N>
      {sub && (
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17, lineHeight: '26px', color: 'var(--text-body)', margin: '10px 0 0', maxWidth: '68ch', textWrap: 'pretty' }}>
          {sub}
        </p>
      )}
    </>
  )
}

export function Parrafo({ children, style }) {
  return (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: 0, ...style }}>
      {children}
    </p>
  )
}

export function Mudo({ children, style }) {
  return (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '22px', color: 'var(--text-muted)', margin: 0, ...style }}>
      {children}
    </p>
  )
}

/** Pares etiqueta/valor, el patrón de datos de las fichas y expedientes. */
export function Datos({ items, columnas = 2 }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${columnas > 1 ? 240 : 100}px,1fr))`, gap: 20, margin: 0 }}>
      {items.map(({ label, valor }) => (
        <div key={label}>
          <dt style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '20px', color: 'var(--text-muted)' }}>{label}</dt>
          <dd style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: '24px', color: 'var(--text-body)', margin: '2px 0 0' }}>{valor}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Fila de lista/bandeja: título flexible para que no choque con la insignia al saltar de línea. */
export function Fila({ to, titulo, meta, derecha = null, children, ultima = false }) {
  const contenido = (
    <>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, lineHeight: '25px', color: 'var(--text-title)', margin: 0 }}>{titulo}</p>
        {meta && <Mudo style={{ marginTop: 2 }}>{meta}</Mudo>}
        {children}
      </div>
      {derecha}
    </>
  )
  const estilo = {
    display: 'flex', gap: 16, alignItems: 'center', padding: '18px 20px',
    ...(ultima ? null : { borderBottom: '1px solid var(--border-subtle)' }),
  }
  return to ? (
    <Link to={to} style={{ ...estilo, textDecoration: 'none', color: 'inherit' }}>{contenido}</Link>
  ) : (
    <div style={estilo}>{contenido}</div>
  )
}

export function Lista({ children }) {
  return <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--surface-card)' }}>{children}</div>
}

export function Vacio({ titulo, children }) {
  return (
    <div style={{ border: '1px dashed var(--border-subtle)', borderRadius: 8, padding: 48, textAlign: 'center', background: 'var(--surface-subtle)' }}>
      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--text-title)', margin: 0 }}>{titulo}</p>
      <Mudo style={{ marginTop: 8 }}>{children}</Mudo>
    </div>
  )
}
