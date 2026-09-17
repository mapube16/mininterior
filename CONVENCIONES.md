# Convenciones del port (leer antes de escribir una pantalla)

Portamos los `.dc.html` del handoff a React + Vite. **Alta fidelidad**: el markup y los
estilos inline del `<x-dc>` se copian tal cual a JSX; lo que cambia es el andamiaje.

## Equivalencias

| En el `.dc.html` | En React |
|---|---|
| `<x-import ... TopBar/Header/tricolor/main/Footer>` | `<Layout>` (ya los incluye; **no repetir**) |
| `<x-import ... DesignSystem_0b54b8.Foo prop-bar="x">` | `import { Foo } from '../ds/index.js'` y `<Foo bar="x">` (props en camelCase: `button-label` → `buttonLabel`, `seal-label` → `sealLabel`) |
| `<sc-for list="{{ xs }}" as="x">` | `{xs.map((x) => (...))}` con `key` |
| `<sc-if value="{{ c }}">` | `{c && (...)}` |
| `renderVals()` | `useState` local + constantes del módulo |
| `style="a:b;c:d"` | `style={{ a: 'b', c: 'd' }}` (camelCase, números sin `px` donde JSX lo permite) |
| `href="P3%20Ficha...dc.html"` | `to={R.comunidad}` de `../routes.js`, con `ruta()` si lleva `:params` |
| miga de pan `<ol>` nativa | `<Migas items={[{label, href}, {label}]} />` de `../components/Layout.jsx` |

## Reglas

1. **Layout** envuelve todo: `<Layout ancho={1160} backoffice>`. `ancho` = el `max-width`
   del `<main>` original. `backoffice` para pantallas internas (cambia nav y subtítulo).
2. **Nada de `<a href>` interno.** Navegación con `<Link to>` de react-router o `<BotonLink to>`
   (el `Button href` del kit recarga la SPA entera). `Button` normal solo con `onClick` o anclas `#`.
3. **Datos** desde `../mock/datos.js`. Si una pantalla necesita datos que no están ahí y solo
   los usa ella, decláralos como constante del módulo arriba del componente. No inventes datos
   nuevos si el `.dc.html` ya trae los suyos: cópialos.
4. **Primitivas** de `../components/ui.jsx` en vez de reinventar: `Estado` (insignia con color
   + símbolo), `Aviso`, `Tarjeta`, `Titulo`, `Parrafo`, `Mudo`, `Datos`, `Fila`, `Lista`, `Vacio`,
   `BotonLink`. Si el diseño original difiere del primitivo, respeta el diseño original.
5. **Estado local** con `useState`, como el prototipo. Sin store global, sin backend: las
   acciones que llamarían a una API (firmar, aprobar, radicar) cambian estado local y muestran
   el resultado. Marca el punto con `// TODO(backend): ...`.
6. **Accesibilidad**: conserva `aria-*`, `aria-hidden` en los íconos decorativos, área activa
   de 44px, y el color nunca solo (siempre acompañado de símbolo o texto).
7. **`TextField.onChange` entrega un evento** (`e.target.value`); `Select`, `SearchBar` y
   `RadioGroup` entregan el **valor** directo. No confundirlos.
8. Nombre de archivo: `src/pages/P<N><NombreCorto>.jsx`, export default, sin `index.js` de barril.
9. Español en textos, comentarios y nombres, como el resto del proyecto.

## Ejemplos ya portados (léelos antes de empezar)

- `src/pages/P1Inicio.jsx` — pantalla simple, tarjetas, SearchBar.
- `src/pages/P2Consulta.jsx` — filtros, lista+mapa, hover sincronizado, estado vacío, estado de falla.
- `src/components/ui.jsx` y `src/components/Layout.jsx` — lo que puedes reutilizar.

## Verificación

Al terminar tus pantallas: `npx vite build` debe pasar sin errores ni warnings nuevos.
No toques archivos fuera de las pantallas que te tocaron (ni `App.jsx`, ni `routes.js`,
ni `ui.jsx`, ni `datos.js`) — el orquestador los cablea.
Si necesitas un dato compartido nuevo en `datos.js`, decláralo en tu pantalla y anótalo
en tu reporte final.
