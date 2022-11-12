// 'use client';

import {useEffect, useState} from 'react';

export default function BannerView() {
  const [client, setClient] = useState(false);

  useEffect(() => {
    console.log('test useeffect banner');
    setClient(true);
  }, []);

  if (!client) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: '10px',
      }}>
      <div>BannerView. client component. not ssr</div>
    </div>
  );
}
