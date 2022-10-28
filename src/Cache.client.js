// import {unstable_getCacheForType, unstable_useCacheRefresh} from 'react';
import {createFromFetch} from 'react-server-dom-webpack/client';
import wrapPromise from './use-promise';

// function createResponseCache() {
//   return new Map();
// }

// export function useRefresh() {
//   const refreshCache = unstable_useCacheRefresh();
//   return function refresh(key, seededResponse) {
//     refreshCache(createResponseCache, new Map([[key, seededResponse]]));
//   };
// }

let _promise;
let _suspendedPromise;

export function useServerResponse(location) {
  const key = JSON.stringify(location);

  /**
   * Not available on react@next tag...
   */
  // const cache = unstable_getCacheForType(createResponseCache);
  // let response = cache.get(key);
  // if (response) {
  // return response;
  // }

  if (!_promise) {
    _promise = Promise.resolve(
      createFromFetch(fetch('/react?location=' + encodeURIComponent(key)))
    );
    _suspendedPromise = wrapPromise(_promise);
  }
  return _suspendedPromise;
}
