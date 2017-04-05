import React, {Component, createElement} from 'react';
import {ifNot, getDisplayName} from './utils';
import { autorun } from 'mobx';
import { inject, observer } from 'mobx-react';

function withRoute(BaseComponent, activateClass=false, storeName='routerStore') {

  @inject(storeName)
  @observer
  class ComponentWithRoute extends Component {
    constructor(props, context) {
      super(props, context);

      this.routerStore = props[storeName];
      this.router = this.routerStore.router;

      this.isActive = this.isActive.bind(this);
    }

    componentDidMount() {
      ifNot(
        this.router.hasPlugin('MOBX_PLUGIN'),
        '[mobx-router5-react][withRoute] missing mobx plugin'
      );
    }

    isActive(routeName, routeParams, activeStrict) {
      return this.router.isActive(routeName, routeParams, activeStrict);
    }

    render() {
      ifNot(
        !this.props.router && !this.props.route && !this.props.previousRoute,
        '[react-mobx-router5] prop names `router`, `route` and `previousRoute` are reserved.'
      );

      // stupid trick to force re-rendering when decorating with @observer
      if (this.routerStore) {
        const route = this.routerStore.route;
      }

      let linkClassName = '';

      // Apply activeClassName for a specific route to the wrapped component
      if (activateClass && this.props.to ) {
        let {to , routeParams, className, activeClassName, activeStrict } = this.props;
        routeParams = routeParams || {};
        activeStrict = activeStrict || false;
        activeClassName = activeClassName || 'active';

        const active = this.isActive(to, routeParams, activeStrict);
        linkClassName = (className ? className.split(' ') : [])
        .concat(active ? [activeClassName] : []).join(' ');

      }

      return createElement(BaseComponent, { ...this.props, className: linkClassName}, this.props.children);
    }
  }

  ComponentWithRoute.displayName = 'WithRoute[' + getDisplayName(BaseComponent) + ']';

  return ComponentWithRoute;
}

export default withRoute;
