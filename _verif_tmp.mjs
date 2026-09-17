import { chromium } from 'playwright-core'

const BASE = 'http://localhost:4191'
const nav = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const ctx = await nav.newContext()
const pag = await ctx.newPage()
pag.on('requestfailed', (r) => console.log(`  [falló] ${r.url()} :: ${r.failure()?.errorText}`))
pag.on('response', (r) => { if (r.url().includes('railway')) console.log(`  [resp] ${r.status()} ${r.url()}`) })
pag.on('pageerror', (e) => console.log(`  [error js] ${e.message}`))

await pag.goto(`${BASE}/ingreso`)
await pag.waitForTimeout(500)
await pag.locator('input[type="email"]').pressSequentially('elena.vargas@mininterior.gov.co')
await pag.locator('input[type="password"]').pressSequentially('demo1234')
await pag.getByRole('button', { name: 'Entrar', exact: true }).click()
await pag.waitForTimeout(4000)
console.log('url', pag.url())
console.log((await pag.locator('body').innerText()).split('\n').filter(l=>l.trim()).slice(15, 40).join('\n'))

await nav.close()
