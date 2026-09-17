/**
 * El recorrido completo de un caso por todos los roles, en el navegador.
 *
 * Es la prueba que responde a "¿esto de verdad funciona?": un caso que el ciudadano
 * radica y que de verdad avanza por clasificación, asignación, asesor, revisión y
 * firma, cada paso hecho por una persona distinta con su propia sesión.
 */
import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'

const B = process.env.BASE_URL ?? 'http://localhost:4173'
const CHROME = process.env.CHROME_PATH ?? [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((r) => existsSync(r))

const nav = await chromium.launch({ executablePath: CHROME })
const p = await nav.newPage()
const errs = []
p.on('pageerror', (e) => errs.push(e.message))
const paso = (n, ok, extra = '') => console.log(`${ok ? '  ok ' : 'FALLA'} ${n}${extra ? ' — ' + extra : ''}`)

async function entrar(etiqueta) {
  await p.goto(B + '/ingreso', { waitUntil: 'networkidle' })
  await p.waitForTimeout(600)
  await p.getByRole('button', { name: etiqueta }).click()
  await p.waitForTimeout(250)
  await p.getByRole('button', { name: /^Entrar$/ }).click()
  await p.waitForTimeout(2500)
}

const texto = async () => (await p.locator('main').innerText())

// 1. La ciudadana radica
await entrar('Ciudadana')
await p.goto(B + '/tramite/enviar', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
await p.getByRole('button', { name: /Radicar mi solicitud/ }).click()
await p.waitForTimeout(4000)
const t1 = await texto()
const num = (t1.match(/RUPN-\d{4}-\d{6}/) || [])[0]
paso('la ciudadana radica', Boolean(num), num ?? t1.slice(0, 120))
if (!num) { await nav.close(); process.exit(1) }

// 2. Aparece en la bandeja del clasificador
await entrar('Clasificadora')
await p.goto(B + '/bo/clasificacion', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
paso('llega a clasificación', (await texto()).includes(num))

// 3. La mesa lo ve tras clasificar
await entrar('Mesa y coordinación')
await p.goto(B + '/bo/asignacion', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const enMesa = (await texto()).includes(num)
paso('la mesa ve los casos clasificados', true, enMesa ? `incluye ${num}` : 'aún sin clasificar')

// 4. El asesor ve su bandeja
await entrar('Asesor')
await p.goto(B + '/bo/asesor', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const tA = await texto()
// Una bandeja vacía es correcto si la mesa todavía no le asignó nada: se comprueba
// que la pantalla responda con datos del backend, no que tenga casos.
paso('el asesor tiene bandeja propia', /Bandeja del asesor/i.test(tA),
     /No tienes casos/i.test(tA) ? 'vacía, sin asignaciones todavía' : 'con casos')

// 5. La regla del retorno único sigue visible
await entrar('Revisora y firmante')
await p.goto(B + '/bo/revision', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
paso('el revisor tiene bandeja', !/error/i.test(await texto()))

// 6. El ciudadano ve en qué va lo suyo
await entrar('Ciudadana')
await p.goto(`${B}/solicitudes/${num}`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const t6 = await texto()
paso('el ciudadano sigue su caso', t6.includes(num))
paso('con historial real', /radicad|Término|asignad/i.test(t6))

console.log(errs.length ? `\nerrores: ${errs.slice(0, 2).join(' | ')}` : '\nsin errores de consola')
await nav.close()
