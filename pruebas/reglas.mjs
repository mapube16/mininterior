// Verifica que las reglas no negociables del handoff se comporten, no solo que rendericen.
import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'
const B = process.env.BASE_URL ?? 'http://localhost:4173'
// Usa el Chrome/Edge instalado; CHROME_PATH lo sobreescribe.
const CHROME = process.env.CHROME_PATH ?? [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((r) => existsSync(r))
if (!CHROME) {
  console.error('No encontré Chrome ni Edge. Define CHROME_PATH.')
  process.exit(2)
}
const nav = await chromium.launch({ executablePath: CHROME })
const p = await nav.newPage()
const r = []
const chk = (n, ok, det='') => { r.push({n, ok, det}); console.log(`${ok?'  ok ':'FALLA'} ${n}${det?' — '+det:''}`) }

// 1. Retorno único: 004871 ya lo usó -> deshabilitado. 004320 no -> habilitado.
for (const [rad, esperado] of [['RUPN-2026-004871', true], ['RUPN-2026-004320', false]]) {
  await p.goto(`${B}/bo/revision/${rad}`, { waitUntil: 'networkidle' })
  const b = p.getByRole('button', { name: /devolver al asesor/i }).first()
  const dis = await b.count() ? await b.isDisabled() : null
  chk(`retorno único ${rad}`, dis === esperado, `deshabilitado=${dis}, esperado=${esperado}`)
}

// 2. Pre-revisión sin veredicto: nada de "aprobado automático" ni porcentajes de confianza.
await p.goto(`${B}/bo/revision/RUPN-2026-004871`, { waitUntil: 'networkidle' })
const t = (await p.locator('main').innerText()).toLowerCase()
chk('pre-revisión sin veredicto', !/(aprobado autom|% de confianza|confianza:|puntaje|score)/.test(t))

// 3. El sistema llena, no decide: sin sentido+fundamento, no se puede proyectar.
await p.goto(`${B}/bo/asesor/RUPN-2026-004871`, { waitUntil: 'networkidle' })
const proy = p.getByRole('button', { name: /registrar decisi/i }).first()
chk('sin decisión no se proyecta', await proy.isDisabled(), 'bloqueado al entrar')
// y se abre solo cuando hay sentido Y fundamento
await p.locator('input[type=radio]').first().check()
chk('solo el sentido no basta', await proy.isDisabled(), 'sigue bloqueado con sentido pero sin fundamento')
await p.locator('textarea, input[type=text]').first().fill('Cumple los requisitos del Decreto 1745 de 1995.')
await p.waitForTimeout(150)
chk('con sentido y fundamento se habilita', !(await proy.isDisabled()))

// 4. Firma por lote: bloqueada hasta confirmar cada documento.
await p.goto(`${B}/bo/firma/RUPN-2026-004871`, { waitUntil: 'networkidle' })
const lote = p.getByRole('button', { name: /firmar/i }).filter({ hasNotText: /cancelar/i }).first()
chk('firma exige confirmación', await lote.count() ? await lote.isDisabled() : false)

// 5. Privacidad: la ficha pública no revela datos restringidos.
await p.goto(`${B}/comunidad/3`, { waitUntil: 'networkidle' })
const pub = (await p.locator('main').innerText()).toLowerCase()
const fuga = ['rosalba mosquera', 'censo', 'cédula', 'teléfono', 'dirigente'].filter(x => pub.includes(x))
chk('P3 sin datos restringidos', fuga.length === 0, fuga.length ? 'aparece: ' + fuga.join(', ') : '')

// 6. La ficha interna sí los muestra (contraste con la pública).
await p.goto(`${B}/bo/comunidad/3`, { waitUntil: 'networkidle' })
const int = (await p.locator('main').innerText()).toLowerCase()
chk('P25 sí muestra representante', int.includes('mosquera'))

await nav.close()
const mal = r.filter(x => !x.ok)
console.log(mal.length ? `\n${mal.length} REGLA(S) INCUMPLIDA(S)` : `\nLAS ${r.length} REGLAS SE CUMPLEN`)
process.exit(mal.length ? 1 : 0)
