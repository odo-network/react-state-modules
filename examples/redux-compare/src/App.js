import React, { Component } from 'react';

import { connect } from 'react-redux';

import { dispatchIncrement, dispatchDecrement } from './store/actions';

import logo from './logo.svg';
import './App.css';

let time = false;

class App extends Component {
  componentDidUpdate() {
    if (time) {
      console.timeEnd('start');
      time = false;
    }
  }
  render() {
    const { counter = {}, increment, decrement } = this.props;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">Current Value: {counter.value}</p>
        <button
          onClick={() => {
            time = true;
            console.time('start');
            increment(1);
          }}
        >
          Increment
        </button>
        <button onClick={() => decrement(1)}>Decrement</button>
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
    increment: by => dispatch(dispatchIncrement(by)),
    decrement: by => dispatch(dispatchDecrement(by)),
  }),
)(App);
