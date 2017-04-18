
export const getDisplayName = component => component.displayName || component.name || 'Component';

export const ifNot = (condition, errorMessage) => {
  if (!condition) throw new Error(errorMessage);
};

/**
 * Given a route (name or object) and a routeNodeName it returns the relevant component associated with a sub-route (being the given route) of the current routeNode
 *
 * extracted from the custom (nested) routes definition (with 'component' field)
 * @param {object|string} route - either the route Object or a the route name. Usually it's the currently active route
 * @param {string} routeNodeName - the name of the route for the React component from where to re-render (transition node)
 * @param {array} routesConfig - nested routes configuration object (with 'component' field)
 * @returns {React.Component} - the component to be rendered
 */
//TODO: test and remove routeNodeName
export function getComponentFromRoutes(route, routeNodeName, routesConfig) {

  const routeName = typeof route === 'object' && route.hasOwnProperty('name') ? route.name : route;
  const routeSegments = routeName.split('.'); // Break route in segments (levels)

  let routeLevels;
  if (routeName === '') {
    routeLevels = 0;
  }
  else {
    routeLevels = routeSegments.length ? routeSegments.length : 1; // if no sub-routes -> level 1
  }

  let currentLevel = 0;
  // Recurse until it gets the relevant portion of the routes obj or the component itself
  function getComponent(routesConfig) {
    for (const currentRoute of routesConfig) {
      if (currentRoute.name === routeSegments[currentLevel]) {
        //exit Conditions
        if (currentLevel >= routeLevels-1) {
          if (currentRoute.component) {
            return currentRoute.component
          }
          throw new Error('route does not have component');
        }
        else {
          if (currentRoute.children) {
            currentLevel += 1;
            return getComponent(currentRoute.children)
          }
          throw new Error('route doen not have children');
        }
      }
    }
    throw new Error('could not find route');
  }
  return getComponent(routesConfig);
}
