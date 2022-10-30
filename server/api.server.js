'use strict';

require('./polyfill')();

const {readFileSync} = require('fs');
const path = require('path');
const express = require('express');
const compress = require('compression');
const React = require('react');

/**
 * Usual React SSR
 */
const {renderToPipeableStream} = require('react-dom/server');

/**
 * @TODO should be this one? but got connection error.
 * This is for rendering reactEl to stream
 */
// const {renderToReadableStream: rtr} = require('react-dom/server.browser');
const {
  renderToReadableStream,
} = require('react-server-dom-webpack/server.browser');

/**
 * This will convert stream to RSC format for hydration
 */
const {createFromReadableStream} = require('react-server-dom-webpack/client');

const {
  decodeText,
  getHydratedReactEl,
  readableStreamTee,
  handleErrors,
} = require('./util');

/**
 * Our root App
 */
const ReactApp = require('../src/App.server').default;

/**
 * @TODO hackaround for client component on ssr ....
 * This might not work on production, need to test.
 * However this is only for learning how RSC x SSR integrated, DON'T use this code on PRODUCTION!!!
 */
let CM = {};
try {
  CM = require('../build/client-manifest').default;
} catch (e) {
  console.error('ERROR-CM:', e);
}
const _wpr = __webpack_require__;
if (!global.__webpack_require__) {
  global.__webpack_require__ = (id) => {
    const CompMeta = _wpr(`${id}`);
    const CompCb = CM[CompMeta.default.filepath];

    /**
     * If not found, just render null on server, but it'll cause hydration warnings...
     */
    if (!CompCb || typeof CompCb !== 'function') {
      return {
        default: () => null,
      };
    }

    const Comp = CompCb();
    console.log(`>>Request to client component success: ${id}`);
    return Comp;
  };
}

(async () => {
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
      // await waitForWebpack();
      const html = readFileSync(
        path.resolve(__dirname, '../build/index.html'),
        'utf8'
      );
      const segments = html.split(`<div id="root">`);

      console.log('>>getStream:renderToReadableStream');
      const stream = await getStream(res, {});

      const [renderStream, forwardStream] = readableStreamTee(stream);
      await renderStream.allReady;
      console.log('>>createFromReadableStream');
      const reactEl = await createFromReadableStream(renderStream);

      const forwardReader = forwardStream.getReader();
      console.log('>>getHydratedReactEl');
      const hydratedStr = await getHydratedReactEl(forwardReader);

      console.log('>>renderToPipeableStream\n');
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
    // await waitForWebpack();
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
          // err
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
})();
