// 'use client';

/**
 *
 * @TODO client component not work yet
 * got: TypeError: (0 , react__WEBPACK_IMPORTED_MODULE_0__.useEffect) is not a function
 */
import {useEffect} from 'react';

export default function CommentView() {
  useEffect(() => {
    console.log('test');
  }, []);

  const handleClick = () => {
    console.log('click');
  };

  return (
    <div>
      <div> Client component</div>
      <button onClick={handleClick}>click</button>
    </div>
  );
}
