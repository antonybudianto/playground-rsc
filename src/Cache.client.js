import {
  createFromFetch,
  createFromReadableStream,
} from 'react-server-dom-webpack/client';
import usePromise from './use-promise';

/**
 *
 * @TODO Still don't know the proper way to hydrate this yet :'D
 * Need to create readable stream from string...
 */
function getHydratedUrl() {
  const __RSC = window.__rsc;
  const blob = new Blob([__RSC], {type: 'text/plain; charset=utf-8'});
  const url = window.URL.createObjectURL(blob);
  return url;
}

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

  const cbProm = () => {
    let p = window.__rsc
      ? createFromFetch(fetch(getHydratedUrl()))
      : createFromFetch(fetch('/react?location=' + encodeURIComponent(key)));
    return Promise.resolve(p);
  };
  return usePromise(cbProm);
}
