'use strict';

require('isomorphic-unfetch');
const {
  ReadableStream,
  TransformStream,
} = require('web-streams-polyfill/ponyfill');
if (!global.ReadableStream) {
  global.ReadableStream = ReadableStream;
}
if (!global.TransformStream) {
  global.TransformStream = TransformStream;
}

const register = require('react-server-dom-webpack/node-register');
register();
const babelRegister = require('@babel/register');

babelRegister({
  ignore: [/[\\\/](build|server|node_modules)[\\\/]/],
  presets: [['react-app', {runtime: 'automatic'}]],
  plugins: ['@babel/transform-modules-commonjs'],
});

const express = require('express');
const compress = require('compression');
const {readFileSync} = require('fs');
const {unlink, writeFile} = require('fs').promises;
const {renderToPipeableStream} = require('react-server-dom-webpack/server');

const {
  renderToString,
  renderToReadableStream,
} = require('react-dom/server.browser');

const path = require('path');
const React = require('react');
const {createFromReadableStream} = require('react-server-dom-webpack/client');
const ReactApp = require('../src/App.server').default;

const PORT = process.env.PORT || 4000;
const app = express();

function readableStreamTee(readable) {
  const transformStream = new TransformStream();
  const transformStream2 = new TransformStream();
  const writer = transformStream.writable.getWriter();
  const writer2 = transformStream2.writable.getWriter();

  const reader = readable.getReader();
  function read() {
    reader.read().then(({done, value}) => {
      if (done) {
        writer.close();
        writer2.close();
        return;
      }
      writer.write(value);
      writer2.write(value);
      read();
    });
  }
  read();

  return [transformStream.readable, transformStream2.readable];
}

function decodeText(input, textDecoder) {
  return textDecoder
    ? textDecoder.decode(input, {stream: true})
    : new TextDecoder().decode(input);
}

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

function handleErrors(fn) {
  return async function(req, res, next) {
    try {
      return await fn(req, res);
    } catch (x) {
      next(x);
    }
  };
}

app.get(
  '/',
  handleErrors(async function(_req, res) {
    await waitForWebpack();
    const html = readFileSync(
      path.resolve(__dirname, '../build/index.html'),
      'utf8'
    );

    // const tmpKey = JSON.stringify({});
    const stream = await getStream(res, {});
    await stream.allReady;
    const str = await streamToString(stream);
    // const [renderStream, forwardStream] = readableStreamTee(stream);
    // const v = createFromReadableStream(renderStream);
    // console.log('v', v);
    console.log('str12', str);
    const finalHtml = html.replace('{{ssr}}', str);
    res.send(finalHtml);
  })
);

async function renderReactTree(res, props) {
  await waitForWebpack();
  const manifest = readFileSync(
    path.resolve(__dirname, '../build/react-client-manifest.json'),
    'utf8'
  );
  const moduleMap = JSON.parse(manifest);
  const {pipe} = renderToPipeableStream(
    React.createElement(ReactApp, props),
    moduleMap
  );
  pipe(res);
}

async function streamToString(stream) {
  const reader = stream.getReader();
  const textDecoder = new TextDecoder();

  let bufferedString = '';

  while (true) {
    const {done, value} = await reader.read();

    if (done) {
      return bufferedString;
    }

    bufferedString += decodeText(value, textDecoder);
  }
}

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
