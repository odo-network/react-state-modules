/* @flow */
import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { Consumer as StateModuleConsumer, Provider as StateModuleProvider } from './context';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function reactStateModulesConnector(subscriber, listener) {
  /**
   * Indicates whether the connection requires prop updates sent to the subscriber.
   */
  const isDynamicConnection = subscriber.dynamic;

  /**
   * When the connector utilizes dynamic selectors (using functions based on the props of the Component),
   * we need to update the selector subscriptions whenever props occur.  A true update will only occur if
   * the actual selector path is changed.
   */
  function getDerivedStateFromProps(props, state = {}) {
    let derivedState = null;
    if (isDynamicConnection && state.subscription && state.subscription.setSelectorProps(props)) {
      derivedState = Object.create(null);
      // when a props updates ends up changing any of our selectors,
      // we need to reset the state using the new props.
      derivedState.selected = state.subscription.getSelectorState(props);
    }
    if (props.$state && state.parentState !== props.$state) {
      derivedState = derivedState || Object.create(null);
      derivedState.parentState = props.$state;
      derivedState.parentStateUpdated = true;
    }
    return derivedState;
  }

  function getChildProps(parentProps, state) {
    const props = Object.create(null);
    if (parentProps.$state) {
      props.selected = {
        ...parentProps.$state.selected,
        ...state.selected,
      };
      props.actions = {
        ...parentProps.$state.actions,
        ...subscriber.dispatchers,
      };
    } else {
      props.selected = state.selected;
      props.actions = subscriber.dispatchers;
    }
    return props;
  }

  return WrappedComponent => {
    /**
     * Calculated DisplayName which is provided to both the forardRed and connected component
     */
    const displayName = `StateConnected(|${getDisplayName(WrappedComponent)}|)`;

    class StatefulComponentConnector extends React.Component<*, *> {
      /**
       * In order to maintain the appropriate top-down state rendering, we need to inform our parent of our intent to re-render based upon a
       * state change.  Each connected parent will receive the re-render requests and continue to pass the re-render request until we reach the
       * top-level Provider.
       *
       * At this point we can then iterate the requesters in reverse-order to ensure a top-down re-render performantly.
       *
       * @memberof StatefulComponentConnector
       */
      actions = {
        // passed to our children via Provider
        childActions: {
          subscribe: flusher => {
            if (this.#queue.size === 0) {
              this.#queue.add(flusher);
              this.#parent.subscribe(this.actions.flush);
            } else {
              this.#queue.add(flusher);
            }
          },
          unsubscribe: flusher => {
            if (this.#queue.has(flusher)) {
              this.#queue.delete(flusher);
              if (!this.#dirty && this.#queue.size === 0) {
                this.#parent.unsubscribe(this.actions.flush);
              }
            }
          },
        },
        // parent is letting us update necessary components
        flush: () => {
          if (this.#dirty) {
            // when we are dirty, we will re-render first then flush our children if necessary
            this.componentDidUpdate = this.stateModuleFlushChildren;
            this.forceUpdate();
          } else {
            this.stateModuleFlushChildren();
          }
        },
      };

      static displayName = displayName;

      displayName = displayName;

      constructor(props) {
        super(props);

        this.#parent = props.stateModuleParentActions;

        if (subscriber.selectors) {
          this.state.subscription = listener.subscribe({
            /**
             * Whenever the values selected by any of the components connected selectors change,
             * the "next" function will be called by the connected StateModule.  We simply forceUpdate
             * the component which causes getDerivedStateFromProps to capture the update.
             */
            next: (nextState, updateID) => {
              // when our subscription updates we need to update our state but we do not necessarily
              // want to re-render immediately.  We need to "bubble-up" so that we can maintain a top-down
              // rendering approach when an update needs to propagate through our component tree.
              this.stateModuleDidUpdate(nextState, updateID);
            },
            complete: () => this.state.subscription.unsubscribe(),
          });
          if (isDynamicConnection) {
            // set initial props
            this.state.subscription.setSelectorProps(props);
          }
          this.state.selected = this.state.subscription.getSelectorState(props);
          this.#childProps = getChildProps(props, this.state);
        }
      }

      state = {
        parentStateUpdated: false,
        parentState: undefined,
        subscription: undefined,
        updateID: -1,
        selected: undefined,
      };

      componentWillUnmount() {
        if (this.state.subscription) {
          this.state.subscription.unsubscribe();
        }
      }

      static getDerivedStateFromProps = undefined;

      /**
       * Whenever our subscription is triggered stateModuleDidUpdate is called to handle
       * the update.  This will only be triggered when this components selected state is
       * changed.
       *
       * @memberof StatefulComponentConnector
       */
      stateModuleDidUpdate = (nextState, updateID) => {
        // console.log('StateModule Did Update');
        this.#dirty = true;
        this.state.selected = nextState;
        this.state.updateID = updateID;
        // inform our parent component that we wish to re-render on the next render flush
        this.#parent.subscribe(this.actions.flush);
      };

      /**
       * When we need to flush our children queue, this is called.  Generally this replaces
       * this.componentDidUpdate when state changes occur but we need to render ourselves
       * before our children are re-rendered.
       */
      stateModuleFlushChildren = () => {
        this.componentDidUpdate = undefined;
        if (this.#queue.size) {
          // * Is this necessary?  Idea here is that we need to clear the queue in case our children rendering
          // * causes any kind of changes synchronously that end up starting our cycle anew.
          const queue = new Set(this.#queue);
          this.#queue.clear();
          queue.forEach(flush => flush());
        }
      };

      /** Holds the props we will pass to our children (props.$state).  The object is re-created whenever a change occurs so that our children trigger a re-render */
      #childProps = Object.create(null);

      /** Stores the next StatefulComponentConnector up in the tree to run actions against when needed */
      #parent = undefined;

      /** Each child requesting an update is added to the queue and parent continues by requesting an update itself */
      #queue = new Set();

      /** When we want to render the component when flushed, we mark the component as "dirty".  If we are flushed and dirty is false, we pass the request to our children instead */
      #dirty = false;

      render() {
        const { $forwardedRef$, $parent$, ...parentProps } = this.props;

        // if our parent changes for any reason we will update the value
        this.#parent = $parent$;

        if (this.state.parentStateUpdated || this.#dirty) {
          this.state.parentStateUpdated = false;
          this.#childProps = getChildProps(parentProps, this.state);
        }

        if (this.#dirty) {
          // If we are "dirty" we will unmark ourselves when rendered.  If we do not
          // have any children marked as dirty then we also need to inform our parent
          // that we no longer wish to be updated
          this.#dirty = false;
          if (this.#queue.size === 0) {
            this.#parent.unsubscribe(this.actions.flush);
          }
        }

        return (
          <StateModuleProvider value={this.actions.childActions}>
            <WrappedComponent ref={$forwardedRef$} $state={this.#childProps} {...parentProps} />
          </StateModuleProvider>
        );
      }
    }

    if (isDynamicConnection) {
      StatefulComponentConnector.getDerivedStateFromProps = getDerivedStateFromProps;
    }

    // Note the second param "ref" provided by React.forwardRef.
    // We can pass it along to StatefulComponentConnector as a regular prop,
    // e.g. "forwardedRef" and it can then be attached to the Component.
    function forwardRef(props, ref) {
      return (
        <StateModuleConsumer>
          {parent => <StatefulComponentConnector $forwardedRef$={ref} $parent$={parent} {...props} />}
        </StateModuleConsumer>
      );
    }

    hoistNonReactStatics(StatefulComponentConnector, WrappedComponent);

    forwardRef.displayName = displayName;

    return React.forwardRef(forwardRef);
  };
}
