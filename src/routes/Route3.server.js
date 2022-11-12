import {Suspense} from 'react';

import FeedView from '../components/FeedView.server';
import BannerView from '../components/BannerView.client';
import CommentView from '../components/CommentView.client';

export default function Route3() {
  return (
    <div className="main">
      <div>Hello, server component here</div>
      <FeedView />
      <Suspense fallback={<div>loading banner...</div>}>
        <CommentView />
        <BannerView></BannerView>
      </Suspense>
    </div>
  );
}
