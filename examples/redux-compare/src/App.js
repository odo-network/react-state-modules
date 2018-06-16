import React, { Component } from 'react';

import { connect } from 'react-redux';

import { dispatchIncrement, dispatchDecrement } from './store/actions';

import logo from './logo.svg';
import './App.css';

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
        <button onClick={() => increment(1, 'default')}>Increment</button>
        <button onClick={() => decrement(1, 'default')}>Decrement</button>
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    counter: state.shared,
    // counter: props.counterID ? state.counter[props.counterID] : state.counter.default,
  }),
  dispatch => ({
    increment: (by, counterID) => dispatch(dispatchIncrement(by, counterID)),
    decrement: (by, counterID) => dispatch(dispatchDecrement(by, counterID)),
  }),
)(App);
