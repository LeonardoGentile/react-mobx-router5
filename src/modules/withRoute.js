import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import {ifNot, getDisplayName} from './utils';


/**
 * HOC that creates a new wrapper ComponentWithRoute around BaseComponent
 *
 * @param BaseComponent - the component to be wrapped
 * @param storeName - the mobx-router5 store instance name. Default 'routerStore'
 * @returns {ComponentWithRoute}
 */
function withRoute(BaseComponent, storeName='routerStore') {

 /**
  * Wrapper ComponentWithRoute around the BaseComponent
  *
  * The wrapper is injected with the mobx routerStore and decorated with @observer
  * Notice that @inject will also create another wrapper around the ComponentWithRoute
  *
  * The component accepts all the props normally accepted by the BaseLink component and will forward them down to the wrapped component.
  * If a linkClassName is passed then it will be passed down and used by the children only when the BaseComponent is created with `withLink` HOC.
  * NOTE: the routerStore will be injected into the ComponentWithRoute.props, so it will also forwarded down to the wrapped component
  *
  * Any route changes will trigger a rendering of ComponentWithRoute.
  * Also the wrapped BaseComponent and children will re-render because passing 3 extra changing props to it (apart from this.props):
  *   - route: the mobx observable routerStore.route, used to trigger a re-rendering of the BaseComponent when the route changes
  *   - previousRoute: the mobx observable routerStore.previousRoute, same as above
  *   - className: if a prop `routeName` is passed to ComponentWithRoute then it adds an `active` className to the original className when routeName==routerStore.route
  *
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

      const {activeClassName, activeStrict, routeOptions, routeParams, linkClassName, onClick, routeName, className } = this.props;

      let currentClassName = className || '';
      if (routeName) {
        const isActive = this.isActive(routeName, routeParams, activeStrict);
        currentClassName = ComponentWithRoute.computeClassName(className, activeClassName, isActive);
      }

      // De-referencing a mobx-observable will trigger a re-rendering (because of the @observer)
      const {route, previousRoute}  = this.routerStore;
      const newProps = {
        // Props Extra injected
        routerStore: this.routerStore,
        route,
        previousRoute,
        // Props Default forwarded
        routeOptions,
        routeParams,
        // Props optional forwarded
        linkClassName,
        onClick,
        routeName,
        // Props computed injected
        className: currentClassName
      };

      return (
        <BaseComponent {...newProps} >
          {this.props.children}
        </BaseComponent>
      )
    }
  }

  ComponentWithRoute.displayName = 'WithRoute[' + getDisplayName(BaseComponent) + ']';

  ComponentWithRoute.defaultProps = {
    activeClassName: 'active',
    activeStrict: false,
    routeOptions: {},
    routeParams: {}
  };

  ComponentWithRoute.propTypes = {
    // Defaults
    activeClassName:  PropTypes.string,
    activeStrict:     PropTypes.bool,
    routeOptions:     PropTypes.object,
    routeParams:      PropTypes.object,
    // Optional
    linkClassName:    PropTypes.string,
    onClick:          PropTypes.func,
    routeName:        PropTypes.string,
    className:        PropTypes.string
  };

  // Because @inject creates an extra HOC
  ComponentWithRoute.wrappedComponent.propTypes = {};
  ComponentWithRoute.wrappedComponent.propTypes[storeName] = PropTypes.object.isRequired;

  return ComponentWithRoute;
}

export default withRoute;
