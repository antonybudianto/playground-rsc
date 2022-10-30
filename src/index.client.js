import {hydrateRoot} from 'react-dom/client';
import Root from './Root.client';

const initialCache = new Map();
hydrateRoot(
  document.getElementById('root'),
  <Root initialCache={initialCache} />
);

// Note: in this example, the initial page is rendered on the client.
// However, the intended solution (which isn't built out yet) is to
// have the server send the initial HTML, and hydrate from it.
