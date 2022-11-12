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

  const goToRoute1 = () => {
    history.pushState({}, null, '/route1');
  };

  const goToRoute2 = () => {
    history.pushState({}, null, '/route2');
  };

  return (
    <div
      style={{
        marginTop: '10px',
      }}>
      <div>CommentView. client component. count:{count}</div>
      <button onClick={handleClick}>click</button>
      <button onClick={goToRoute1}>go to /route1</button>
      <button onClick={goToRoute2}>go to /route2</button>
    </div>
  );
}
