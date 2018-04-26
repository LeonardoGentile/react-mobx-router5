import {Component, createElement} from 'react';
import PropTypes from 'prop-types';
import {getDisplayName, ifNot} from './utils';
import {autorun, toJS} from 'mobx';
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
          route: this.routerStore.route
        };

        this.shouldUpdateNode = this.routerStore.shouldUpdateNodeFactory(this.nodeName);
      }

      componentDidMount() {
        this.autorunDisposer = autorun(() => {
          // Change state only if this should update
          // This will re-render this component and so the wrapped RouteSegment component
          if (this.shouldUpdateNode.get()) {
            this.setState({
              route: this.routerStore.route
            });
          }
        });
      }

      componentWillUnmount() {
        this.autorunDisposer();
      }

      render() {
        const {route} = this.state;
        const plainRoute = toJS(route); // convert to plain object
        return createElement(RouteComponent, {...this.props, [storeName]: this.props[storeName], route, plainRoute});
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
