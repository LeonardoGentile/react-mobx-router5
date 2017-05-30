import PropTypes from 'prop-types';
import {createElement} from "react";
import {getComponent} from './utils';

/**
 * Route component: it should be used inside a routeNode component
 *
 * It select and render the correct component associated with the current route for the given routeNodeName
 *
 * @return {object|null}
 */
function RouteView(props) {

  const {routerStore, route, routeNodeName, routes, ...passThroughProps } = props;

  let routeToRender = route || null;
  let ComponentToRender = null;

  if (!route) {
    if (!props.routerStore) {
      throw new Error("Route Component requires either a route or a routerStore prop")
    }
    routeToRender = props.routerStore.route;
  }

  try {
    ComponentToRender = getComponent(routeToRender, routeNodeName, routes);
  }
  catch (e) {
    console.error("could not find the component to render");
  }

  // Add ==> {key: route.meta.id}, to props to pass below for a full unmount/mount
  return ComponentToRender ? createElement(ComponentToRender, {route, ...passThroughProps} ) : null;
}


RouteView.displayName = 'RouteView';

RouteView.propTypes = {
  routes: PropTypes.array.isRequired,
  routeNodeName: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
  routerStore: PropTypes.object
};

export default RouteView;


