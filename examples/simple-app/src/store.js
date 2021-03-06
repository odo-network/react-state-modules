import createState from 'state-modules';
import connectReact from './react-state-modules';

const created = Date.now();

const state = createState({
  // hooks: {
  //   before: [
  //     action => {
  //       // console.group('[STATE-MODULES] DISPATCHING: ', action);
  //       console.time(action.type);
  //     },
  //   ],
  //   after: [
  //     action => {
  //       // console.log(nextState);
  //       console.timeEnd(action.type);
  //       console.groupEnd();
  //     },
  //   ],
  // },
});

state.create({
  config: { cid: 'counter' },
  state: {
    counter: {
      default: { value: 0, created, updated: created },
    },
  },
  selectors: {
    counterByID: props => ['counter', props.counterID || 'default'],
  },
  actions: {
    increment: ['by', 'counterID'],
    decrement: ['by', 'counterID'],
  },
  helpers: {
    createCounter(draft, counterID, initialValue = 0, now = Date.now()) {
      draft.counter[counterID] = {
        value: initialValue,
        created: now,
        updated: now,
      };
    },
  },
  reducers: {
    CREATE(draft, { counterID, initialValue = 0 }) {
      this.helpers.createCounter(draft, counterID, initialValue);
    },
    INCREMENT(draft, { by = 1, counterID = 'default' }) {
      const now = Date.now();
      if (!draft.counter[counterID]) {
        this.helpers.createCounter(draft, counterID, now);
      }

      const counter = draft.counter[counterID];

      counter.value += by;
      counter.updated = now;
    },
    DECREMENT(draft, { by = 1, counterID = 'default' }) {
      const now = Date.now();
      if (!draft.counter[counterID]) {
        this.helpers.createCounter(draft, counterID, now);
      }

      const counter = draft.counter[counterID];

      counter.value -= by;
      counter.updated = now;
    },
  },
});

const connector = state.connect(connectReact);

export default connector;
