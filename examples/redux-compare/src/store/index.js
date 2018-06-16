import { createStore, combineReducers, applyMiddleware } from 'redux';
import reducers from './reducers';

const logger = store => next => action => {
  console.time(action.type);
  console.group('[REDUX] DISPATCHING: ', action);
  const result = next(action);
  console.log(store.getState());
  console.timeEnd(action.type);
  console.groupEnd();
  return result;
};

let store;

function configureStore() {
  if (store) return store;
  store = createStore(
    combineReducers(reducers),
    {},
    // applyMiddleware() tells createStore() how to handle middleware
    applyMiddleware(logger),
  );
  return store;
}

export default configureStore;
