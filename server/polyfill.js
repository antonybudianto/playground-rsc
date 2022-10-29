function initPolyfill() {
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
}

module.exports = initPolyfill;
