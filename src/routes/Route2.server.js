import {Suspense} from 'react';
import Route2Action from './Route2Action.client';

export default function Route2() {
  return (
    <div>
      <div>Hello, this is Route 2</div>
      <Suspense fallback={<div>loading action...</div>}>
        <Route2Action />
      </Suspense>
    </div>
  );
}
