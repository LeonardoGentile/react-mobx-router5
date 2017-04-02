import React, { Component, createElement } from 'react';
import { getDisplayName, ifNot} from './utils';
import { autorun } from 'mobx';
import { inject} from 'mobx-react';

//TODO: create another wrapper function to pass a custom store name
function routeNode(nodeName, storeName='routerStore') { // route node Name, routerStore name
  return function routeNodeWrapper(RouteSegment) { // component Name

    @inject(storeName)
    class RouteNode extends Component {

      constructor(props, context) {
        super(props, context);
        this.router = this.props[storeName].router;
        this.state = {
          route: props[storeName].route,
          intersectionNode: props[storeName].intersectionNode,
        };
      }

      componentDidMount() {
        ifNot(
          this.router.hasPlugin('MOBX_PLUGIN'),
          '[react-router5][roteNode] missing mobx plugin'
        );
        this.autorunDisposer = autorun(() => {
          this.setState({
            route: this.props[storeName].route,
            intersectionNode: this.props[storeName].intersectionNode
          });
        });
      }

      componentWillUnmount() {
        this.autorunDisposer();
      }
      // Re-render the route-node (wrapped component) only if
      // it is the correct "transition node"
      shouldComponentUpdate (newProps, newState) {
        return (newState.intersectionNode === nodeName);
      }

      render() {
        const { props } = this;
        const component = createElement(
          RouteSegment,
          { ...props }
        );

        return component;
      }
    }

    RouteNode.displayName = 'RouteNode[' + getDisplayName(RouteSegment) + ']';

    return RouteNode;
  };
}

export default routeNode;
