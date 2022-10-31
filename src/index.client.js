import {hydrateRoot} from 'react-dom/client';
import Root from './Root.client';

const initialCache = new Map();
hydrateRoot(
  document.getElementById('root'),
  <Root initialCache={initialCache} />
);
