import {createFromFetch} from 'react-server-dom-webpack/client';
import usePromise from './use-promise';

/**
 * @TODO
 * Need to create readable stream from hydrated string and pass to React.createFromFetch....
 * Not sure if this is the correct way, but it works :D
 */
async function getHydratedStreamResp() {
  return new Response(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const enc = encoder.encode(window.__rsc);
        controller.enqueue(enc);
      },
    })
  );
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
      ? createFromFetch(getHydratedStreamResp())
      : createFromFetch(fetch('/react?location=' + encodeURIComponent(key)));
    return Promise.resolve(p);
  };
  return usePromise(cbProm);
}
