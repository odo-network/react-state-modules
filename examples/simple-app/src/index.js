import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from './react-state-modules';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

function Render() {
  return (
    <Provider>
      <App />
    </Provider>
  );
}
ReactDOM.render(<Render />, document.getElementById('root'));
registerServiceWorker();
