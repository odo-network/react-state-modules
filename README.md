# React State Modules

React State Modules mmakes it simple to connect your React Components to any of your State Modules easily. It provides a convenient mechanism that is meant to work similar to the `react-redux` connection pattern.

```javascript
import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import connect from "./store";

class App extends Component {
  render() {
    const { counter = {}, increment, decrement } = this.props;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">Current Value: {counter.value}</p>
        <button onClick={() => increment(1)}>Increment</button>
        <button onClick={() => decrement(1)}>Decrement</button>
      </div>
    );
  }
}

export default connect(
  selectors => ({
    counter: selectors.counterByID
  }),
  actions => actions
)(App);
```
