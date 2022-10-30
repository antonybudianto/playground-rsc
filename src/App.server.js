import {Suspense} from 'react';

import CommentView from './CommentView.client';
import FeedView from './FeedView.server';

export default function App() {
  return (
    <div className="main">
      {/* <Suspense fallback={<div>loading...</div>}> */}
      <div>Hello, test</div>
      <FeedView />
      <CommentView />
      {/* </Suspense> */}
    </div>
  );
}
