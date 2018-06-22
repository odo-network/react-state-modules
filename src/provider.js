import * as React from 'react';
import { Provider } from './context';

export default class StateModuleTopLevelProvider extends React.Component {
  #actions = {
    // passed to our children via Provider
    childActions: {
      subscribe: flusher => {
        flusher();
      },
      unsubscribe: () => {},
    },
  };
  render() {
    return <Provider value={this.#actions.childActions}>{this.props.children}</Provider>;
  }
}
