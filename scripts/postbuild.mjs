// Copie index.html en 404.html : les adresses profondes fonctionnent aussi
// sur un hébergement statique sans réécriture (GitHub Pages, Netlify, etc.).
import { copyFileSync, writeFileSync } from 'node:fs'
copyFileSync('dist/index.html', 'dist/404.html')
writeFileSync('dist/vercel.json', JSON.stringify(JSON.parse(await (await import('node:fs/promises')).readFile('vercel.json', 'utf8')), null, 2))
console.log('postbuild : 404.html et vercel.json prêts dans dist/')
