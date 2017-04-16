import React, {Component} from 'react';
import {ifNot, getDisplayName} from './utils';
import { inject, observer } from 'mobx-react';

/**
 * HOC that creates a new wrapper ComponentWithRoute around BaseComponent
 *
 * @param BaseComponent - the component to be wrapped
 * @param storeName - the mobx-router5 instance name. Default 'routerStore'
 * @returns {ComponentWithRoute}
 */
function withRoute(BaseComponent, storeName='routerStore') {

 /**
  * Wrapper ComponentWithRoute around the BaseComponent
  *
  * The wrapper is injected with the mobx routerStore and decorated with @observer
  * Notice that @inject will also create another wrapper around the ComponentWithRoute
  *
  * Any route changes will trigger a re-rendering of ComponentWithRoute and so of its wrapped BaseComponent and children.
  * The component accepts all the props also accepted by the BaseLink component and will pass them down to the wrapped component.
  * If a linkClassName is passed then it will be passed down and used by the children only when the BaseComponent is created with `withLink` HOC.
  *
  * It will pass 3 extra props to the wrapped BaseComponent:
  *   route: the mobx observable routerStore.route, used to trigger a re-rendering of the BaseComponent when the route changes
  *   previousRoute: the mobx observable routerStore.previousRoute, same as above
  *   className: if a prop `routeName` is passed to ComponentWithRoute then it adds an `active` className to the original className when routeName==routerStore.route
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

      // De-referencing a mobx-observable will trigger a re-rendering (because of the @observer)
      const {route, previousRoute}  = this.routerStore;
      const {routeName, routeParams, activeStrict, className, activeClassName } = this.props;

      let currentClassName = className || '';
      if (routeName) {
        const isActive = this.isActive(routeName, routeParams, activeStrict);
        currentClassName = ComponentWithRoute.computeClassName(className, activeClassName, isActive);
      }
      const newProps = {...this.props, route, previousRoute, className: currentClassName};
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
    activeClassName:  React.PropTypes.string,
    activeStrict:     React.PropTypes.bool,
    routeOptions:     React.PropTypes.object,
    routeParams:      React.PropTypes.object,
    // Optional
    linkClassName:    React.PropTypes.string,
    onClick:          React.PropTypes.func,
    routeName:        React.PropTypes.string,
  };

  // Because @inject creates an extra HOC
  ComponentWithRoute.wrappedComponent.propTypes = {};
  ComponentWithRoute.wrappedComponent.propTypes[storeName] = React.PropTypes.object.isRequired;

  return ComponentWithRoute;
}

export default withRoute;
