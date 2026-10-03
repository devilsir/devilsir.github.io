import fs from 'node:fs'
import assert from 'node:assert/strict'
import path from 'node:path'
import { harness,root } from './harness.mjs'

const file=path.resolve(process.argv[2]||path.join(root,'ORBITAL-offline.html'))
const html=fs.readFileSync(file,'utf8')
assert.ok(!/<script\s+src=|<link\s+rel="stylesheet"/.test(html))
assert.ok(!/src="assets\//.test(html))
const h=harness(null,file)
await Promise.all(h.run('Object.values(imgs)').map(image=>image.decode()))
assert.equal(h.run('waves.length'),8)
assert.equal(h.doc.querySelectorAll('.unit-card').length,15)
assert.ok(h.run('Object.values(imgs).every(i=>i.complete&&i.naturalWidth>0)'))
h.run('selected="miniSun";placeAt({x:gridX[0],y:curveY(0,gridX[0])});startWave();render()')
assert.equal(h.run('running'),true)
assert.equal(h.run('defenders.length'),1)
h.doc.getElementById('campaignBtn').click()
assert.equal(h.doc.querySelectorAll('.campaign-node').length,8)
assert.ok([...h.doc.querySelectorAll('img')].every(image=>image.getAttribute('src').startsWith('data:image/png;base64,')))
h.doc.getElementById('hubClose').click()
h.doc.getElementById('labBtn').click()
h.run('Physics.tick(.1)')
assert.ok(h.doc.getElementById('orbitReadout').textContent.length>0)
assert.ok(h.doc.getElementById('orbitCanvas').native)
await h.close()
console.log('PASS HTML único: scripts, estilos e imagens embutidos; boot, construção, combate, campanha e laboratório.')
