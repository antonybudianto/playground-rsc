import {useCallback} from 'react';
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

function hydrate() {
  console.log('==hydrate');
  return createFromFetch(getHydratedStreamResp());
}

export function useServerResponse({key, cache}) {
  const cbProm = useCallback(() => {
    let p =
      window.__rsc && window.__rsckey === location.pathname + location.search
        ? hydrate()
        : createFromFetch(fetch('/react?location=' + encodeURIComponent(key)));
    return Promise.resolve(p);
  }, [key]);

  if (cache.has(key)) {
    return cache.get(key);
  }

  /**
   * @TODO
   * replace with `React.use(cbProm)` when it's available...
   */
  const el = usePromise(key, cbProm);
  cache.set(key, el);
  return el;
}
