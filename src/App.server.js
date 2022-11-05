import {Suspense} from 'react';

import BannerView from './Banner.client';
import CommentView from './CommentView.client';
import FeedView from './FeedView.server';

export default function App() {
  return (
    <div className="main">
      <div>Hello, server component here</div>
      <FeedView />
      <CommentView />
      <Suspense fallback={<div>loading banner...</div>}>
        <BannerView></BannerView>
      </Suspense>
    </div>
  );
}
