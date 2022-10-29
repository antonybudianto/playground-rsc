function decodeText(input, textDecoder) {
  return textDecoder
    ? textDecoder.decode(input, {stream: true})
    : new TextDecoder().decode(input);
}

async function getHydratedReactEl(forwardReader) {
  return new Promise((resolve) => {
    let responsePartial;
    function readForward() {
      forwardReader.read().then(({done, value}) => {
        if (done) {
          resolve(responsePartial);
        } else {
          responsePartial = decodeText(value);
          readForward();
        }
      });
    }
    readForward();
  });
}

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

function handleErrors(fn) {
  return async function(req, res, next) {
    try {
      return await fn(req, res);
    } catch (x) {
      next(x);
    }
  };
}

module.exports = {
  decodeText,
  getHydratedReactEl,
  readableStreamTee,
  handleErrors,
};
