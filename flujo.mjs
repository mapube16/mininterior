import { chromium } from 'playwright-core'
const B='http://localhost:4190'
const nav = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const p = await nav.newPage()
const errs=[]; p.on('pageerror',e=>errs.push(e.message))

// 1. entrar como ciudadana
await p.goto(B+'/ingreso',{waitUntil:'networkidle'}); await p.waitForTimeout(800)
await p.getByRole('button',{name:'Ciudadana'}).click(); await p.waitForTimeout(300)
await p.getByRole('button',{name:/^Entrar$/}).click(); await p.waitForTimeout(3000)
console.log('1. entra ->', new URL(p.url()).pathname)
const sesion=(await p.locator('body').innerText()).match(/Sesión de [^\n]*/)
console.log('   sesion:', sesion? sesion[0] : 'NO MUESTRA')

// 2. radicar
await p.goto(B+'/tramite/enviar',{waitUntil:'networkidle'}); await p.waitForTimeout(1500)
await p.getByRole('button',{name:/Radicar mi solicitud/}).click(); await p.waitForTimeout(4000)
const t=await p.locator('main').innerText()
const num=(t.match(/RUPN-\d{4}-\d{6}/)||[])[0]
console.log('2. radicado:', num ?? 'FALLO')
console.log('   confirma:', /qued[oó] radicada/i.test(t)?'SI':'NO')

// 3. ver en que va
if(num){
  await p.goto(`${B}/solicitudes/${num}`,{waitUntil:'networkidle'}); await p.waitForTimeout(2500)
  const s=await p.locator('main').innerText()
  console.log('3. seguimiento muestra el caso:', s.includes(num)?'SI':'NO')
  console.log('   historial real:', /Solicitud radicada|Término de/i.test(s)?'SI':'no')
}
// 4. aparece en mis solicitudes
await p.goto(B+'/solicitudes',{waitUntil:'networkidle'}); await p.waitForTimeout(2500)
const m=await p.locator('main').innerText()
console.log('4. aparece en mis solicitudes:', num && m.includes(num)?'SI':'NO')
console.log('errores:', errs.length?errs.slice(0,2):'ninguno')
await nav.close()
