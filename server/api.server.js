'use strict';

require('./polyfill')();

const {readFileSync, existsSync} = require('fs');
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
} = require('./utils/util');
const {loadCM, loadHTML, loadReactManifest} = require('./utils/manifest');

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

let html = '';
let reactManifest;

if (process.env.NODE_ENV === 'production') {
  CM = loadCM();
  html = loadHTML();
  reactManifest = loadReactManifest();
}

if (!global.__webpack_require__) {
  global.__webpack_require__ = (id) => {
    const CompCb = CM[`${id}`];

    /**
     * If not found, just render null on server, but it'll cause hydration warnings...
     */
    if (!CompCb || typeof CompCb !== 'function') {
      return {
        default: () => null,
      };
    }

    const Comp = CompCb();
    return Comp;
  };
}

async function runServer() {
  const PORT = process.env.PORT || 4000;
  const app = express();
  app.use(compress());
  app.use(express.json());

  runServer();

  async function runServer() {
    app
      .listen(PORT, () => {
        console.log(`React Notes running at http://localhost:${PORT}...`);
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
  }

  function getStream(req, res, props) {
    if (process.env.NODE_ENV === 'development') {
      reactManifest = loadReactManifest();
    }
    const moduleMap = JSON.parse(reactManifest);
    const stream = renderToReadableStream(
      React.createElement(ReactApp, {
        path: props.path,
      }),
      moduleMap
    );
    return stream;
  }

  async function renderReactTree(req, res, props) {
    const stream = getStream(req, res, props);
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
    res.set('X-Location', JSON.stringify(req.query.location));
    renderReactTree(req, res, {
      path: req.query.location,
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

  app.use(express.static('build', {index: false}));
  app.use(express.static('public', {index: false}));

  app.get(
    '*',
    handleErrors(async function(req, res, next) {
      if (process.env.NODE_ENV === 'development') {
        html = loadHTML();
      }

      const segments = html.split(`<div id="root">`);

      console.log('>>getStream:renderToReadableStream');
      const stream = getStream(req, res, {path: req.path});

      const [renderStream, forwardStream] = readableStreamTee(stream);
      const forwardReader = forwardStream.getReader();

      console.log('>>getHydratedReactEl');
      console.log('>>createFromReadableStream');

      const [hydratedStr, reactEl] = await Promise.all([
        getHydratedReactEl(forwardReader, res),
        createFromReadableStream(renderStream),
      ]);

      console.log('>>renderToPipeableStream\n');
      const ssrStream = renderToPipeableStream(reactEl, {
        onShellReady() {
          res.statusCode = 200;
          res.setHeader('Content-type', 'text/html');
          res.write(segments[0] + `<div id="root">`);
          ssrStream.pipe(res);
        },
        onAllReady() {
          res.write(
            `<script type="text/javascript">window.__rsc=${JSON.stringify(
              hydratedStr
            )}</script>\n
            <script type="text/javascript">window.__rsckey="${
              req.originalUrl
            }";</script>`
          );
          res.write(segments[1]);
        },
        onError(err) {
          console.log('>> ERR:SSR:', err);
        },
        onShellError(err) {
          console.log('>> ERR-SHELL:SSR:', err);
        },
      });
    })
  );
}

async function waitForWebpack() {
  while (true) {
    try {
      const jsonMReady = existsSync(
        path.resolve(__dirname, '../build/react-client-manifest.json')
      );
      if (!jsonMReady) {
        throw Error('waiting');
      }
      const generate = require('../manifestGenerator');
      generate();
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

const wait = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

(async () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('============================');
    console.log('= NOT FOR PRODUCTION ! ! ! =');
    console.log('= Only for experimenting   =');
    console.log('============================');
    await waitForWebpack();
    await wait(1000);
  }
  CM = loadCM();
  runServer();
})();
