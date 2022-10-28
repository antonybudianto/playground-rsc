function wrapPromise(promise) {
  let status = 'pending';
  let response;

  const suspender = promise.then(
    (res) => {
      status = 'success';
      response = res;
    },
    (err) => {
      status = 'error';
      response = err;
    }
  );

  const read = () => {
    switch (status) {
      case 'pending':
        throw suspender;
      case 'error':
        throw response;
      default:
        return response;
    }
  };

  return {read};
}

let _promise;
let _suspendedPromise;

function usePromise(cb) {
  if (!_promise) {
    _promise = cb();
    _suspendedPromise = wrapPromise(_promise);
  }

  return _suspendedPromise.read();
}

export default usePromise;
