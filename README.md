# React State Modules

React State Modules mmakes it simple to connect your React Components to any of your State Modules easily. It provides a convenient mechanism that is meant to work similar to the `react-redux` connection pattern.

```javascript
// store.js
import createState from "state-modules";
import connectReact from "react-state-modules";

const state = createState().component({
  config: { cid: "counter" },
  state: {
    counter: { value: 0 }
  },
  selectors: {
    counter: "counter"
  },
  actions: {
    increment: ["by"],
    decrement: ["by"]
  },
  reducers: {
    INCREMENT({ by = 1 }, draft) {
      draft.counter.value += by;
    },
    DECREMENT({ by = 1 }, draft) {
      draft.counter.value -= by;
    }
  }
});

const connector = state.connect(connectReact);

export default connector;
```

```javascript
// app.js
import React, { Component } from "react";

import connect from "./store";

class App extends Component {
  render() {
    const { counter, increment, decrement } = this.props;
    return (
      <div>
        <p>Current Value: {counter.value}</p>
        <button onClick={() => increment(1)}>Increment</button>
        <button onClick={() => decrement(1)}>Decrement</button>
      </div>
    );
  }
}

export default connect(
  selectors => ({ counter: selectors.counter }),
  actions => actions
)(App);
```
