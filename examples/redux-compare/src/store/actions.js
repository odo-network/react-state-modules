export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';

function dispatchIncrement(by, counterID = 'default') {
  return {
    type: INCREMENT,
    by,
    counterID,
  };
}

function dispatchDecrement(by, counterID = 'default') {
  return {
    type: DECREMENT,
    by,
    counterID,
  };
}

export { dispatchDecrement, dispatchIncrement };
