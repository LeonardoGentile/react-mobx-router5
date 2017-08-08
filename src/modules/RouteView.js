import PropTypes from 'prop-types';
import {createElement} from 'react';
import {getComponent} from './utils';

/**
 * RouteView component: it should be used inside a routeNode component
 *
 * It select and render the correct component associated with the current route for the given routeNodeName
 *
 * @return {object|null}
 */
function RouteView(props) {

  const {route, routeNodeName, routes, ...passThroughProps } = props;

  let currentRoute = route;
  let ComponentToRender = null;

  try {
    if (!currentRoute) {
      throw new Error('RouteView component requires a route prop');
    }
    const FetchedComponent = getComponent(currentRoute, routeNodeName, routes); // getComponent may throw
    // Add `{key: route.meta.id}` to props for a full unmount/mount
    ComponentToRender = createElement(FetchedComponent, {...passThroughProps, route});
  }
  catch (e) {
    // Do not render and print error to console
    console.error(`RouteView: it was not possible to select the correct view for the current route '${currentRoute.name}' having params: `);
    // This outputs an object on the browser console you can click through
    console.dir(currentRoute.params);
  }

  return ComponentToRender;
}


RouteView.displayName = 'RouteView';

RouteView.propTypes = {
  routes: PropTypes.array.isRequired,
  routeNodeName: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired
};

export default RouteView;


