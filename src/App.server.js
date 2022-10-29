import {Suspense} from 'react';

import Compo from './Compo';

export default function App() {
  return (
    <div className="main">
      <Suspense fallback={<div>loading...</div>}>
        <div>Hello, test</div>
        <Compo />
      </Suspense>
    </div>
  );
}
