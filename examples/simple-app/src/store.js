import createState from 'state-modules';
import connectReact from './react-state-modules';

const created = Date.now();

const state = createState({
  hooks: {
    before: [
      action => {
        console.time(action.type);
        console.group('[STATE-MODULES] DISPATCHING: ', action);
      },
    ],
    after: [
      (action, nextState) => {
        console.log(nextState);
        console.timeEnd(action.type);
        console.groupEnd();
      },
    ],
  },
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
    create: ['counterID', 'initialValue'],
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
    CREATE({ counterID, initialValue = 0 }, draft) {
      this.helpers.createCounter(draft, counterID, initialValue);
    },
    INCREMENT({ by = 1, counterID = 'default' }, draft) {
      const now = Date.now();
      if (!draft.counter[counterID]) {
        this.helpers.createCounter(draft, counterID, now);
      }

      const counter = draft.counter[counterID];

      counter.value += by;
      counter.updated = now;
    },
    DECREMENT({ by = 1, counterID = 'default' }, draft) {
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
