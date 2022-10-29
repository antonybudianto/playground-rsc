'use strict';

require('./polyfill')();

// const register = require('react-server-dom-webpack/node-register');
// register();
const babelRegister = require('@babel/register');

babelRegister({
  ignore: [/[\\\/](build|server|node_modules)[\\\/]/],
  presets: [['react-app', {runtime: 'automatic'}]],
  plugins: ['@babel/transform-modules-commonjs'],
});

const express = require('express');
const compress = require('compression');
const {readFileSync} = require('fs');
const {renderToPipeableStream} = require('react-dom/server');
const path = require('path');
const React = require('react');
const {createFromReadableStream} = require('react-server-dom-webpack/client');
const {
  renderToReadableStream,
} = require('react-server-dom-webpack/server.browser');
const {
  decodeText,
  getHydratedReactEl,
  readableStreamTee,
  handleErrors,
} = require('./util');
const ReactApp = require('../src/App.server').default;

const PORT = process.env.PORT || 4000;
const app = express();

app.use(compress());
app.use(express.json());

app
  .listen(PORT, () => {
    console.log(`React Notes listening at ${PORT}...`);
  })
  .on('error', function(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const isPipe = (portOrPipe) => Number.isNaN(portOrPipe);
    const bind = isPipe(PORT) ? 'Pipe ' + PORT : 'Port ' + PORT;
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

app.get(
  '/',
  handleErrors(async function(_req, res) {
    await waitForWebpack();
    const html = readFileSync(
      path.resolve(__dirname, '../build/index.html'),
      'utf8'
    );
    const segments = html.split(`<div id="root">`);

    // const tmpKey = JSON.stringify({});
    const stream = await getStream(res, {});
    const [renderStream, forwardStream] = readableStreamTee(stream);
    await renderStream.allReady;
    const reactEl = await createFromReadableStream(renderStream);

    const forwardReader = forwardStream.getReader();
    const hydratedStr = await getHydratedReactEl(forwardReader);

    const ssrStream = renderToPipeableStream(reactEl, {
      onAllReady() {
        res.write(segments[0] + `<div id="root">`);
        ssrStream.pipe(res);
        res.write(
          `<script type="text/javascript">window.__rsc=${JSON.stringify(
            hydratedStr
          )}</script>`
        );
        res.write(segments[1]);
      },
    });
  })
);

async function getStream(res, props) {
  await waitForWebpack();
  const manifest = readFileSync(
    path.resolve(__dirname, '../build/react-client-manifest.json'),
    'utf8'
  );
  const moduleMap = JSON.parse(manifest);
  const stream = renderToReadableStream(
    React.createElement(ReactApp, props),
    moduleMap
  );
  return stream;
}

async function renderReactTree(res, props) {
  const stream = await getStream(res, props);
  const reader = await stream.getReader();
  function readForward() {
    reader.read().then(({done, value}) => {
      if (done) {
        res.end();
      } else {
        let responsePartial = decodeText(value);
        res.write(responsePartial);
      }
    });
  }
  readForward();
}

function sendResponse(req, res, redirectToId) {
  const location = JSON.parse(req.query.location);
  if (redirectToId) {
    location.selectedId = redirectToId;
  }
  res.set('X-Location', JSON.stringify(location));
  renderReactTree(res, {
    selectedId: location.selectedId,
    isEditing: location.isEditing,
    searchText: location.searchText,
  });
}

app.get('/react', function(req, res) {
  sendResponse(req, res, null);
});

app.get('/sleep/:ms', function(req, res) {
  setTimeout(() => {
    res.json({ok: true});
  }, req.params.ms);
});

app.use(express.static('build'));
app.use(express.static('public'));

async function waitForWebpack() {
  while (true) {
    try {
      readFileSync(path.resolve(__dirname, '../build/index.html'));
      return;
    } catch (err) {
      console.log(
        'Could not find webpack build output. Will retry in a second...'
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
