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
  * It will pass two extra props to the wrapped BaseComponent:
  *   activeRoute: alias of the mobx observable routerStore.route, used to trigger a re-rendering of the BaseComponent when the route changes
  *   className: if a prop `routeName` is passed to ComponentWithRoute then it adds an `active` className to the original className when routeName==activeRoute
  *
  */
  @inject(storeName)
  @observer
  class ComponentWithRoute extends Component {

    static displayName = 'WithRoute[' + getDisplayName(BaseComponent) + ']';

    static defaultProps = {
      activeClassName: 'active',
      activeStrict: false,
      routeOptions: {},
      routeParams: {}
    };

    static propTypes = {
      // Defaults
      activeClassName:  React.PropTypes.string,
      activeStrict:     React.PropTypes.bool,
      routeOptions:     React.PropTypes.object,
      routeParams:      React.PropTypes.object,
      // Optional
      linkClassName:    React.PropTypes.string,
      onClick:          React.PropTypes.func,
      routeName:        React.PropTypes.string
    };

    static computeClassName(className, activeClassName, isActive) {
      return (className ? className.split(' ') : [])
        .concat(isActive ? [activeClassName] : []).join(' ');
    }

    constructor(props, context) {
      super(props, context);

      this.routerStore = props[storeName];
      this.router = this.routerStore.router;

      this.isActive = this.isActive.bind(this);
    }

    componentDidMount() {
      ifNot(
        this.router && this.router.hasPlugin('MOBX_PLUGIN'),
        '[react-mobx-router5][withRoute] missing mobx plugin'
      );
    }

    isActive(routeName, routeParams, activeStrict) {
      return this.router.isActive(routeName, routeParams, activeStrict);
    }

    render() {
      ifNot(
        !this.props.activeRoute,
        '[react-mobx-router5][withRoute] prop names `activeRoute` is reserved.'
      );

      // stupid trick to force re-rendering when decorating with @observer
      let activeRoute = null;
      if (this.routerStore) {
        activeRoute = this.routerStore.route;
      }
      const {routeName, routeParams, activeStrict, className, activeClassName } = this.props;

      let currentClassName = className || '';
      if (routeName) {
        const isActive = this.isActive(routeName, routeParams, activeStrict);
        currentClassName = ComponentWithRoute.computeClassName(className, activeClassName, isActive);
      }
      const newProps = {...this.props, className: currentClassName, activeRoute:activeRoute};
      return (
        <BaseComponent {...newProps} >
          {this.props.children}
        </BaseComponent>
      )
    }
  }

  return ComponentWithRoute;
}

export default withRoute;
