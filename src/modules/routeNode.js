import { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { getDisplayName, ifNot } from './utils';
import { autorun, expr, untracked } from 'mobx';
import { inject, observer } from 'mobx-react';


function routeNode(nodeName, storeName = 'routerStore') { // route node Name, routerStore name
  return function routeNodeWrapper(RouteSegment) { // component Name

    @inject(storeName)
    @observer
    class RouteNode extends Component {

      constructor(props) {
        super(props);
        this.routerStore = props[storeName];
        ifNot(
          this.routerStore,
          '[react-mobx-router5][routeNode] missing routerStore'
        );
        this.router = this.routerStore.router || null;
        // this.state = {
        //   route: this.routerStore.route,
        //   previousRoute: this.routerStore.previousRoute,
        //   intersectionNode: this.routerStore.intersectionNode,
        // };
      }

      componentDidMount() {
        ifNot(
          this.router && this.router.hasPlugin('MOBX_PLUGIN'),
          '[react-mobx-router5][routeNode] missing mobx plugin'
        );
        // this.autorunDisposer = autorun(() => {
        //   this.setState({
        //     route: this.routerStore.route,
        //     previousRoute: this.routerStore.previousRoute,
        //     intersectionNode: this.routerStore.intersectionNode
        //   });
        // });
      }

      componentWillUnmount() {
        // this.autorunDisposer();
      }

      // re-render this component and so the route-node (wrapped component)
      // only if it is the correct "transition node"
      // shouldComponentUpdate(newProps, newState) {
      //   return (newState.intersectionNode === nodeName);
      // }

      renderChild() {
        const {route, previousRoute} = this.routerStore;
        return createElement(RouteSegment, { ...this.props, route, previousRoute });
      }

      render() {

        const isIntersection = expr(() => this.routerStore.intersectionNode === nodeName);
        return isIntersection ? this.renderChild() : untracked(() => this.renderChild());
      }
    }

    RouteNode.displayName = 'RouteNode[' + getDisplayName(RouteSegment) + ']';

    // Because @inject creates an extra HOC
    RouteNode.wrappedComponent.propTypes /* remove-proptypes */ = {
      [storeName]: PropTypes.object.isRequired
    };

    return RouteNode;
  };
}

export default routeNode;
