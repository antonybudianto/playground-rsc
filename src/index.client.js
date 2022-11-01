import {hydrateRoot} from 'react-dom/client';
import Root from './Root.client';

const cache = new Map();

hydrateRoot(document.getElementById('root'), <Root cache={cache} />);
