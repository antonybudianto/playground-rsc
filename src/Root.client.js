import {useEffect, useState} from 'react';
import {useServerResponse} from './Cache.client';

export default function Root({cache}) {
  const key = window.location.pathname + window.location.search;
  const [currentKey, setCurrentKey] = useState(key);
  useEffect(() => {
    history.onpushstate = (event) => {
      const newKey = window.location.pathname + window.location.search;
      console.log(currentKey, newKey);
      if (currentKey !== newKey) {
        console.log(newKey);
        setCurrentKey(newKey);
      }
    };
    return () => {};
  }, []);

  const response = useServerResponse({key: currentKey, cache});
  console.log('should render only once!', currentKey, response);
  return response;
}
