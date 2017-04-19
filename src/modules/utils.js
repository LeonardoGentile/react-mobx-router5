
export const getDisplayName = component => component.displayName || component.name || 'Component';

export const ifNot = (condition, errorMessage) => {
  if (!condition) throw new Error(errorMessage);
};

/**
 * Given a route (name or object) and a routeNodeName it returns the component to render associated with the relevant route segment
 *
 * This will work only if using the nested routes definition (the one using 'children') and adding a custom `component` field for each route/subroute/routeNode

 * In other words, given a route 'section.subsection.a' we can use this function to get the components to render for the various routeNodes.
 * The component to render could be in turn another routeNode.
 *
 * EXAMPLE: given a route: 'section.subsection.a' we can call this function from the different routeNodes:
 *   - for the routeNode ''                       return --> section.component (a routeNode)
 *   - for the routeNode 'section'                return --> section.subsection.component (a routeNode)
 *   - for the routeNode 'section.subsection'     return --> section.subsection.a.component (the final component to show)
 *
 * @param {object|string} route - either the route Object or a the route name. Usually it's the currently active route
 * @param {string} routeNodeName - the name of the route for the React component from where to re-render (transition node)
 * @param {array} routesConfig - nested routes configuration array (with extra 'component' field for each route)
 * @returns {React.Component} - the component to be rendered
 */
export function getComponent(route, routeNodeName, routesConfig) {

  const routeName = typeof route === 'object' && route.hasOwnProperty('name') ? route.name : route;
  const routeSegments = routeName.split('.'); // Break route in segments (levels)
  const routeNodeSegments = routeNodeName.split('.');

  let currentLevel = 0;
  let routeNodeLevel;

  if (routeNodeName === '') {
    routeNodeLevel = 0;
  }
  else {
    routeNodeLevel = routeNodeSegments.length ? routeNodeSegments.length : 1; // if no sub-routes -> level 1
  }

  // Recurse until it gets the relevant portion of the routes obj or the component itself
  function findComponent(routesConfig) {
    // going deeper every recursion
    const currentSegment = routeSegments[currentLevel];

    for (const currentRoute of routesConfig) {
      if (currentRoute.name === currentSegment) {
        // exit Conditions
        if (currentLevel >= routeNodeLevel) {
          if (currentRoute.component) {
            // first found segment one level deeper than the routeNodeLevel
            return currentRoute.component
          }
          throw new Error('route segment does not have a component field');
        }
        else {
          if (currentRoute.children) {
            currentLevel += 1;
            return findComponent(currentRoute.children)
          }
          throw new Error('route doen not have children');
        }
      }
    }
    throw new Error('could not find route');
  }
  return findComponent(routesConfig);
}
