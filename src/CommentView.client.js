// 'use client';

import {useEffect, useState} from 'react';

export default function CommentView() {
  useEffect(() => {
    console.log('test useeffect didmount');
  }, []);

  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((c) => c + 1);
  };

  return (
    <div
      style={{
        marginTop: '10px',
      }}>
      <div>CommentView. client component. count:{count}</div>
      <button onClick={handleClick}>click</button>
    </div>
  );
}
