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
  if (!global.__webpack_chunk_load__) {
    global.__webpack_chunk_load__ = () => Promise.resolve();
  }
  // if (!global.__webpack_require__) {
  //   global.__webpack_require__ = __webpack_require__;
  // }
}

module.exports = initPolyfill;
