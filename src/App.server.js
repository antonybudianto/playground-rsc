import {Suspense} from 'react';

import BannerView from './Banner.client';
import CommentView from './CommentView.client';
import FeedView from './FeedView.server';
import Route2 from './Route2.server';

export default function App({
  path = typeof window !== 'undefined' ? location.pathname : '',
}) {
  if (path === '/route2') {
    return <Route2 />;
  }
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
