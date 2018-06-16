import React, { Component } from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default function reactStateModulesConnector(subscriber, actions) {
  /**
   * Indicates whether the connection requires prop updates sent to the subscriber.
   */
  let isDynamicConnection = false;

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
      selectedState: subscriber.merge
        ? subscriber.merge(subscriber.state, props)
        : subscriber.state,
      connectedDispatchers: subscriber.dispatchers
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
             * the "next" function will be called by the connected StateModule.
             */
            next: value => {
              this.#shouldUpdate = true;
              this.setState(
                {
                  // The state as-selected in the "withSelectors"
                  selectedState: value.state,
                  // Actions connected in the "withDispatchers"
                  connectedDispatchers: value.dispatchers
                },
                () => {
                  this.#shouldUpdate = false;
                }
              );
            },
            complete: () => {
              subscription.unsubscibe();
            }
          });
          if (subscription.dynamic) {
            /* If the selectors have dynamic values (require props), add our static getDerivedStateFromProps */
            isDynamicConnection = true;
            // set initial props
            this.state.subscription = subscription;
            subscription.setSelectorProps(this.props);
          } else {
            isDynamicConnection = false;
          }
          this.#shouldUpdate = false;
        }
      }

      state = {
        subscription: undefined,
        selectedState: undefined,
        connectedDispatchers: undefined
      };

      static getDerivedStateFromProps = getDerivedStateFromProps;

      shouldComponentUpdate() {
        return this.#shouldUpdate;
      }

      componentWillUnmount() {
        if (this.state.subscription) {
          this.state.subscription.unsubscribe();
        }
      }

      #shouldUpdate = true;

      #subscription = undefined;

      render() {
        const { forwardedRef, ...props } = this.props;
        return (
          <WrappedComponent
            ref={forwardedRef}
            {...props}
            {...this.state.selectedState}
            {...this.state.connectedDispatchers}
          />
        );
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
