import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
const [src, dst] = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage()
await page.goto(`file://${src}`, { waitUntil: 'load' })
await page.pdf({
  path: dst,
  format: 'A4',
  printBackground: true,
  margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate:
    '<div style="width:100%;font-size:8px;color:#8a90a3;padding:0 15mm;display:flex;justify-content:space-between">' +
    '<span>Trigonum Broker · Логика продуктов</span><span class="pageNumber"></span></div>',
})
await browser.close()
console.log(`${dst} готов`)
