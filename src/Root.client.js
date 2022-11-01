import {useServerResponse} from './Cache.client';

export default function Root({cache}) {
  const key = window.location.pathname + window.location.search;

  if (cache.has(key)) {
    return cache.get(key);
  }
  const response = useServerResponse({key, cache});
  console.log('should render only once!', response);
  return response;
}
