import { createStore, combineReducers, applyMiddleware } from 'redux';
import reducers from './reducers';

const logger = () => next => action => {
  console.time(action.type);
  const result = next(action);
  console.timeEnd(action.type);
  return result;
};

let store;

function configureStore() {
  if (store) return store;
  store = createStore(
    combineReducers(reducers),
    {},
    // applyMiddleware() tells createStore() how to handle middleware
    // applyMiddleware(logger),
  );
  return store;
}

export default configureStore;
