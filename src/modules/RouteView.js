import PropTypes from 'prop-types';
import {createElement} from 'react';
import {getComponent} from './utils';

/**
 * Route component: it should be used inside a routeNode component
 *
 * It select and render the correct component associated with the current route for the given routeNodeName
 *
 * @return {object|null}
 */
function RouteView(props) {

  const {route, routeNodeName, routes, ...passThroughProps } = props;

  let routeToRender = route;
  let ComponentToRender = null;

  if (!routeToRender) {
    throw new Error('Route Component requires a route prop');
  }

  try {
    ComponentToRender = getComponent(routeToRender, routeNodeName, routes);
  }
  catch (e) {
    throw e;
  }

  // Add ==> {key: route.meta.id}, to props to pass below for a full unmount/mount
  return ComponentToRender ? createElement(ComponentToRender, {...passThroughProps, route} ) : null;
}


RouteView.displayName = 'RouteView';

RouteView.propTypes = {
  routes: PropTypes.array.isRequired,
  routeNodeName: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired
};

export default RouteView;


