import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import connect from './store';

let time = false;

class App extends Component {
  componentDidUpdate() {
    if (time) {
      console.timeEnd('start');
      time = false;
    }
  }
  render() {
    const {
      counter = {}, increment, decrement, actions, state,
    } = this.props;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">Current Value: {state.counter.value}</p>
        <button
          onClick={() => {
            time = true;
            console.time('start');
            actions.increment(1);
          }}
        >
          Increment
        </button>
        <button onClick={() => actions.decrement(1)}>Decrement</button>
      </div>
    );
  }
}

export default connect(
  selectors => ({
    counter: selectors.counterByID,
  }),
  actions => actions,
)(App);
