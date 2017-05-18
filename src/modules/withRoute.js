import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { ifNot, getDisplayName } from './utils';

/**
 * It creates and returns a new wrapper ComponentWithRoute around BaseComponent
 *
 * @param BaseComponent - the component to be wrapped
 * @param storeName - the mobx-router5 store instance name. Default 'routerStore'
 * @returns {ComponentWithRoute}
 */
function withRoute(BaseComponent, storeName = 'routerStore') {

  /**
   * HOC Wrapper ComponentWithRoute around the BaseComponent
   *
   * The wrapper is injected with the mobx routerStore and decorated with @observer
   * Note: @inject will also create another wrapper around the ComponentWithRoute
   *
   * The component accepts any props and forward them to the wrapped component.
   * Any route changes will trigger a rendering of ComponentWithRoute.
   *
   * Also the wrapped BaseComponent (and children) will re-render because it's injected with:
   *   - route: the mobx observable routerStore.route, used to trigger a re-rendering of the BaseComponent when the route changes
   *   - previousRoute: the mobx observable routerStore.previousRoute, same as above
   *   - className: if a prop `routeName` is passed to ComponentWithRoute then it adds an `active` className
   *     to the original className when routeName==routerStore.route
   *   - isActive: boolean, computed and injected when `routeName` is passed
   *
   * Some special props passed are used to compute if the current wrapped element should be considered "active" or not:
   *  - `routeName` (string): name of the route associated with the component
   *  - `routeParams` (obj) **default** `{}`: the route params
   *  - `activeStrict` (bool) **default** `false`: whether to check if `routeName` is the active route, or part of the active route
   */
  @inject(storeName)
  @observer
  class ComponentWithRoute extends Component {

    static computeClassName(className, activeClassName, isActive) {
      return (className ? className.split(' ') : [])
      .concat(isActive ? [activeClassName] : []).join(' ');
    }

    constructor(props) {
      super(props);
      this.routerStore = props[storeName];
      ifNot(
        this.routerStore,
        '[react-mobx-router5][withRoute] missing routerStore'
      );
      this.router = this.routerStore.router || null;
      ifNot(
        this.router && this.router.hasPlugin('MOBX_PLUGIN'),
        '[react-mobx-router5][withRoute] missing mobx plugin'
      );

      // Bindings
      this.isActive = this.isActive.bind(this);
    }

    isActive(routeName, routeParams, activeStrict) {
      return this.router.isActive(routeName, routeParams, activeStrict);
    }

    render() {
      ifNot(
        !this.props.route && !this.props.previousRoute,
        '[react-mobx-router5][withRoute] prop names `route` and `previousRoute` are reserved.'
      );

      const { routeName, activeStrict, routeParams, activeClassName, className } = this.props;

      let currentClassName = className;
      let isActive = null;
      if (routeName) {
        isActive = this.isActive(routeName, routeParams, activeStrict);
        currentClassName = ComponentWithRoute.computeClassName(className, activeClassName, isActive);
      }

      // De-referencing a mobx-observable will trigger a re-rendering (because of the @observer)
      const { route, previousRoute } = this.routerStore;
      const newProps = {
        ...this.props,
        isActive,
        className: currentClassName,
        routerStore: this.routerStore,
        route,
        previousRoute
      };

      return (
        <BaseComponent {...newProps} >
          {this.props.children}
        </BaseComponent>
      );
    }
  }

  ComponentWithRoute.displayName = 'WithRoute[' + getDisplayName(BaseComponent) + ']';

  ComponentWithRoute.defaultProps = {
    className: '',
    activeClassName: 'active',
    activeStrict: false,
    routeParams: {}
  };

  ComponentWithRoute.propTypes = {
    // Defaults
    className: PropTypes.string,
    activeClassName: PropTypes.string,
    activeStrict: PropTypes.bool,
    routeParams: PropTypes.object,
    // Optional
    routeName: PropTypes.string,
    children: PropTypes.node
  };

  // Because @inject creates an extra HOC
  ComponentWithRoute.wrappedComponent.propTypes /* remove-proptypes */ = {
    [storeName]: PropTypes.object.isRequired
  };

  return ComponentWithRoute;
}

export default withRoute;
