const path = require('path');
const {readFileSync} = require('fs');
const cwd = process.cwd();

function loadCM() {
  try {
    const CM = require('../../build/client-manifest').default;
    return CM;
  } catch (e) {
    console.error('ERROR-CM:', e);
  }
}

function loadHTML() {
  const html = readFileSync(path.resolve(cwd, 'build/index.html'), 'utf8');
  return html;
}

function loadReactManifest() {
  const manifest = readFileSync(
    path.resolve(cwd, 'build/react-client-manifest.json'),
    'utf8'
  );
  return manifest;
}

module.exports = {
  loadCM,
  loadHTML,
  loadReactManifest,
};
