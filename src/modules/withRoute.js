import React, {Component, createElement} from 'react';
import {ifNot, getDisplayName} from './utils';
import { autorun } from 'mobx';
import { inject} from 'mobx-react';

function withRoute(BaseComponent, storeName='routerStore') {

  @inject(storeName)
  class ComponentWithRoute extends Component {
    constructor(props, context) {
      super(props, context);
      this.router = this.props[storeName].router;
      this.state = {
        route: props[storeName].route,
        previousRoute: props[storeName].previousRoute
      };
    }

    componentDidMount() {
      ifNot(
        this.router.hasPlugin('MOBX_PLUGIN'),
        '[react-router5][withRoute] missing mobx plugin'
      );

      // This will trigger a re-rendering for any route change
      this.autorunDisposer = autorun(() => {
        this.setState({
          route: this.props[storeName].route,
          previousRoute: this.props[storeName].previousRoute
        });
      });
    }

    componentWillUnmount() {
      this.autorunDisposer();
    }

    render() {
      ifNot(
        !this.props.router && !this.props.route && !this.props.previousRoute,
        '[react-mobx-router5] prop names `router`, `route` and `previousRoute` are reserved.'
      );

      return createElement(BaseComponent, {...this.props, ...this.state, router: this.router});
    }
  }

  // ComponentWithRoute.wrappedComponent.contextTypes = {};
  // ComponentWithRoute.wrappedComponent.contextTypes[storeName] =  React.PropTypes.object.isRequired;

  ComponentWithRoute.displayName = 'WithRoute[' + getDisplayName(BaseComponent) + ']';

  return ComponentWithRoute;
}

export default withRoute;
