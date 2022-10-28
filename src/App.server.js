import {Suspense} from 'react';

export default function App() {
  return (
    <div className="main">
      <Suspense fallback={<div>loading...</div>}>
        <div>Hello, test</div>
      </Suspense>
    </div>
  );
}
