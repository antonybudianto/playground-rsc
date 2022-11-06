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

let _promiseMap = {};
let _suspendedPromiseMap = {};

function usePromise(key, cb) {
  if (!_promiseMap[key]) {
    _promiseMap[key] = cb();
    _suspendedPromiseMap[key] = wrapPromise(_promiseMap[key]);
  }

  return _suspendedPromiseMap[key].read();
}

export default usePromise;
