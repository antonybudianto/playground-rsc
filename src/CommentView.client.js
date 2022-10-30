// 'use client';

import {useEffect} from 'react';

export default function CommentView() {
  useEffect(() => {
    console.log('test');
  }, []);

  const handleClick = () => {
    window.alert('click');
  };

  return (
    <div>
      <div>Client component</div>
      <button onClick={handleClick}>click</button>
    </div>
  );
}
