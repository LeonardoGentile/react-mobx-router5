import {Component, createElement} from 'react';
import PropTypes from 'prop-types';
import {getDisplayName, ifNot} from './utils';
import {autorun} from 'mobx';
import {inject} from 'mobx-react';


function routeNode(nodeName, storeName = 'routerStore') { // route node Name, routerStore name
  return function routeNodeWrapper(RouteComponent) { // component Name

    @inject(storeName)
    class RouteNode extends Component {

      constructor(props) {
        super(props);
        this.nodeName = nodeName;

        this.routerStore = props[storeName];
        ifNot(
          this.routerStore,
          '[react-mobx-router5][routeNode] missing routerStore'
        );

        this.router = this.routerStore.router || null;
        ifNot(
          this.router && this.router.hasPlugin('MOBX_PLUGIN'),
          '[react-mobx-router5][routeNode] missing mobx plugin'
        );

        this.state = {
          route: this.routerStore.route,
          previousRoute: this.routerStore.previousRoute,
          intersectionNode: this.routerStore.intersectionNode,
        };
      }

      componentDidMount() {
        this.autorunDisposer = autorun(() => {
          this.setState({
            route: this.routerStore.route,
            previousRoute: this.routerStore.previousRoute,
            intersectionNode: this.routerStore.intersectionNode
          });
        });
      }

      componentWillUnmount() {
        this.autorunDisposer();
      }

      // re-render this component and so the route-node (wrapped component)
      // only if it is the correct "transition node"
      shouldComponentUpdate(newProps, newState) {
        return (newState.intersectionNode === this.nodeName);
      }

      render() {
        const {route} = this.state;
        return createElement(RouteComponent, {...this.props, [storeName]: this.props[storeName], route});
      }
    }

    RouteNode.displayName = 'RouteNode[' + getDisplayName(RouteComponent) + ']';

    // Because @inject creates an extra HOC
    RouteNode.wrappedComponent.propTypes /* remove-proptypes */ = {
      [storeName]: PropTypes.object.isRequired
    };

    return RouteNode;
  };
}

export default routeNode;
