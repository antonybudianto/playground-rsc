import {useCallback, useEffect, useState} from 'react';
import {useServerResponse} from './Cache.client';

export default function Root({cache}) {
  const key = window.location.pathname + window.location.search;
  const [currentKey, setCurrentKey] = useState(key);

  const handler = useCallback(
    (event) => {
      const newKey = window.location.pathname + window.location.search;
      if (currentKey !== newKey) {
        setCurrentKey(newKey);
      }
    },
    [currentKey]
  );

  useEffect(() => {
    history.onpushstate = handler;
    return () => {};
  }, [handler]);

  console.log('render root.client.js');
  const response = useServerResponse({key: currentKey, cache});
  return response;
}
