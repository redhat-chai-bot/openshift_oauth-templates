import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const server = process.argv[2];
const source = path.dirname(fileURLToPath(import.meta.url));
if (!server) throw new Error('Usage: yarn build && node sync-server.mjs ../oauth-server');
for (const [page, pkg, constant] of [
  ['login', 'login', 'defaultLoginTemplateString'],
  ['errors', 'errorpage', 'defaultErrorPageTemplateString'],
  ['providers', 'selectprovider', 'defaultSelectProviderTemplateString'],
]) {
  const html = fs.readFileSync(path.join(source, `_site/_okd/${page}/index.html`), 'utf8');
  if (html.includes('`')) throw new Error('Go raw string cannot contain backticks');
  const destination = path.join(server, 'pkg/server', pkg, 'templates.go');
  const original = fs.readFileSync(destination, 'utf8');
  const start = original.indexOf(`const ${constant} = `);
  if (start < 0) throw new Error(`Missing ${constant}`);
  fs.writeFileSync(destination, original.slice(0, start) + `const ${constant} = \`${html}\`\n`);
}
for (const script of ['theme.js', 'login.js']) {
  fs.copyFileSync(path.join(source, `_site/oauth/assets/v1/${script}`), path.join(server, 'pkg/server/assets', script));
}
