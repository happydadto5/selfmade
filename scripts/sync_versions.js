#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const explicitVersion = process.argv[2];
const versionPath = path.join(root, 'VERSION');
const indexPath = path.join(root, 'index.html');
const gamePath = path.join(root, 'js', 'game.js');

const version = (explicitVersion || fs.readFileSync(versionPath, 'utf8')).trim();

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Invalid semver version: ${version}`);
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');
if (!/<div id="version">v[^<]+<\/div>/.test(html)) {
  console.error('Failed to sync index.html version display');
  process.exit(1);
}
const nextHtml = html.replace(/<div id="version">v[^<]+<\/div>/, `<div id="version">v${version}</div>`);
fs.writeFileSync(indexPath, nextHtml, 'utf8');

const gameJs = fs.readFileSync(gamePath, 'utf8');
if (!/const version = '[^']*';/.test(gameJs)) {
  console.error('Failed to sync js/game.js version constant');
  process.exit(1);
}
const nextGameJs = gameJs.replace(/const version = '[^']*';/, `const version = '${version}';`);
fs.writeFileSync(gamePath, nextGameJs, 'utf8');

console.log(`Synced version metadata to ${version}`);
