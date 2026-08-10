import { copyFile } from 'node:fs/promises'

// GitHub Pages is a static host. Serving the built app as its custom 404 page
// lets React Router render a route opened directly, e.g. /Broker/login.
await copyFile('dist/index.html', 'dist/404.html')
