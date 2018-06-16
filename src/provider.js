import * as React from "react";
import { Provider } from "./context";

export default class StateModuleProvider extends React.Component {
  render() {
    return <Provider>{this.props.children}</Provider>;
  }
}
