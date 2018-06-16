import { INCREMENT, DECREMENT } from './actions';

const created = Date.now();

const initialState = {
  shared: { value: 0, created, updated: created },
  counter: {
    default: { value: 0, created, updated: created },
  },
};

const shared = (state = initialState.shared, { type, by = 1 }) => {
  const now = Date.now();
  switch (type) {
    case INCREMENT:
      return { ...state, value: state.value + by, updated: now };
    case DECREMENT:
      return { ...state, value: state.value - by, updated: now };
    default: {
      return state;
    }
  }
};

const counter = (state = initialState.counter, { type, by = 1, counterID = 'default' }) => {
  const now = Date.now();
  switch (type) {
    case INCREMENT:
      return {
        ...state,
        [counterID]: {
          ...(state[counterID] || {}),
          value: state[counterID].value + by,
          updated: now,
          created: state[counterID] ? state[counterID].created : now,
        },
      };
    case DECREMENT:
      return {
        ...state,
        [counterID]: {
          ...(state[counterID] || {}),
          value: state[counterID].value - by,
          updated: now,
          created: state[counterID] ? state[counterID].created : now,
        },
      };
    default: {
      return state;
    }
  }
};

export default { shared, counter };
