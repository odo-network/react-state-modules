import React, { Component } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function reactStateModulesConnector(subscriber, actions) {
  /**
   * Indicates whether the connection requires prop updates sent to the subscriber.
   */
  let isDynamicConnection = false;

  const mergeState = subscriber.merger ? subscriber.merger : s => s;

  /**
   * When the connector utilizes dynamic selectors (using functions based on the props of the Component),
   * we need to update the selector subscriptions whenever props occur.  A true update will only occur if
   * the actual selector path is changed.
   */
  function getDerivedStateFromProps(props, state = {}) {
    if (isDynamicConnection && state.subscription) {
      state.subscription.setSelectorProps(props);
    }
    return {
      state: mergeState(actions.getSelectorState(props), props),
      actions: subscriber.dispatchers,
    };
  }

  return WrappedComponent => {
    /**
     * Calculated DisplayName which is provided to both the forardRed and connected component
     */
    const displayName = `StateConnected<${getDisplayName(WrappedComponent)}>`;

    class StatefulComponentConnector extends Component {
      static displayName = displayName;

      constructor(props) {
        super(props);
        if (subscriber.selectors) {
          const subscription = actions.subscribe({
            /**
             * Whenever the values selected by any of the components connected selectors change,
             * the "next" function will be called by the connected StateModule.  We simply forceUpdate
             * the component which causes getDerivedStateFromProps to capture the update.
             */
            next: () => this.forceUpdate(),
            complete: () => subscription.unsubscribe(),
          });
          if (subscription.dynamic) {
            /* If the selectors have dynamic values (require props), add our static getDerivedStateFromProps */
            isDynamicConnection = true;
            // set initial props
            this.state.subscription = subscription;
            subscription.setSelectorProps(props);
          } else {
            isDynamicConnection = false;
          }
        }
      }

      state = {
        subscription: undefined,
        state: undefined,
        actions: undefined,
      };

      static getDerivedStateFromProps = getDerivedStateFromProps;

      shouldComponentUpdate(np) {
        if (np !== this.props) {
          return true;
        }
        return false;
      }

      componentWillUnmount() {
        if (this.state.subscription) {
          this.state.subscription.unsubscribe();
        }
      }

      render() {
        const { forwardedRef, ...props } = this.props;
        if (this.state.state) {
          props.state = this.state.state;
        }
        if (this.state.actions) {
          props.actions = this.state.actions;
        }
        return <WrappedComponent ref={forwardedRef} {...props} />;
      }
    }

    // Note the second param "ref" provided by React.forwardRef.
    // We can pass it along to StatefulComponentConnector as a regular prop,
    // e.g. "forwardedRef" and it can then be attached to the Component.
    function forwardRef(props, ref) {
      return <StatefulComponentConnector {...props} forwardedRef={ref} />;
    }

    hoistNonReactStatics(StatefulComponentConnector, WrappedComponent);

    forwardRef.displayName = displayName;

    return React.forwardRef(forwardRef);
  };
}
