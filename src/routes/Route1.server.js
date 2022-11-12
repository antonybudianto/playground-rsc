import FeedView from '../components/FeedView.server';

export default function Route1() {
  return (
    <div>
      <div>Hello, this is Route 1st - Pure Server Component</div>
      <div>
        <FeedView />
      </div>
    </div>
  );
}
