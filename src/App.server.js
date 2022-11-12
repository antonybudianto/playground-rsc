import Route1 from './routes/Route1.server';
import Route2 from './routes/Route2.server';
import Route3 from './routes/Route3.server';

export default function App({
  path = typeof window !== 'undefined' ? location.pathname : '',
}) {
  if (path === '/route1') {
    return <Route1 />;
  }
  if (path === '/route2') {
    return <Route2 />;
  }
  return <Route3 />;
}
