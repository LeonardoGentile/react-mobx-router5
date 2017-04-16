import React, { Component, createElement } from 'react';
import { getDisplayName, ifNot} from './utils';
import { autorun } from 'mobx';
import { inject } from 'mobx-react';


function routeNode(nodeName, storeName='routerStore') { // route node Name, routerStore name
  return function routeNodeWrapper(RouteSegment) { // component Name

    @inject(storeName)
    class RouteNode extends Component {

      constructor(props) {
        super(props);
        this.routerStore = props[storeName];
        ifNot(
          this.routerStore,
          '[react-mobx-router5][routeNode] missing routerStore'
        );
        this.router = this.routerStore.router || null;
        this.state = {
          route: this.routerStore.route,
          intersectionNode: this.routerStore.intersectionNode,
        };
      }

      componentDidMount() {
        ifNot(
          this.router && this.router.hasPlugin('MOBX_PLUGIN'),
          '[react-mobx-router5][routeNode] missing mobx plugin'
        );
        this.autorunDisposer = autorun(() => {
          this.setState({
            route: this.routerStore.route,
            intersectionNode: this.routerStore.intersectionNode
          });
        });
      }

      componentWillUnmount() {
        this.autorunDisposer();
      }

      // re-render this component and so the route-node (wrapped component)
      // only if it is the correct "transition node"
      shouldComponentUpdate (newProps, newState) {
        return (newState.intersectionNode === nodeName);
      }

      render() {
        return createElement(RouteSegment, { ...this.props });
      }
    }

    RouteNode.displayName = 'RouteNode[' + getDisplayName(RouteSegment) + ']';

    // Because @inject creates an extra HOC
    RouteNode.wrappedComponent.propTypes = {};
    RouteNode.wrappedComponent.propTypes[storeName] = React.PropTypes.object.isRequired;

    return RouteNode;
  };
}

export default routeNode;
