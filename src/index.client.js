import {hydrateRoot} from 'react-dom/client';
import Root from './Root.client';

const cache = new Map();

// Monkey patching window.history
(function(history) {
  var pushState = history.pushState;
  history.pushState = function(state) {
    const res = pushState.apply(history, arguments);
    if (typeof history.onpushstate == 'function') {
      history.onpushstate({
        state: state,
      });
    }
    return res;
  };
})(window.history);

hydrateRoot(document.getElementById('root'), <Root cache={cache} />);
