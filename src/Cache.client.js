// import {unstable_getCacheForType, unstable_useCacheRefresh} from 'react';
import {createFromFetch} from 'react-server-dom-webpack/client';
import usePromise from './use-promise';

// function createResponseCache() {
//   return new Map();
// }

// export function useRefresh() {
//   const refreshCache = unstable_useCacheRefresh();
//   return function refresh(key, seededResponse) {
//     refreshCache(createResponseCache, new Map([[key, seededResponse]]));
//   };
// }

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

  const cbProm = () =>
    Promise.resolve(
      createFromFetch(fetch('/react?location=' + encodeURIComponent(key)))
    );
  return usePromise(cbProm);
}
