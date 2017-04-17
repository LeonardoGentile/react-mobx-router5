
export const getDisplayName = component => component.displayName || component.name || 'Component';

export const ifNot = (condition, errorMessage) => {
  if (!condition) throw new Error(errorMessage);
};

/**
 * Return a component to be rendered by a routeNode for the current route
 * extracted from the custom (nested) routes definition (with 'component' field)
 * @param {object} route - the current active route object
 * @param {string} routeNodeName - the name of the route for the React component from where to re-render (transition node)
 * @param {array} routesConfig - nested routes configuration object (with 'component' field)
 * @returns {React.Component} - the component to be rendered
 */
export function getComponentFromRoutes(route, routeNodeName, routesConfig) {
  let level = 0;
  let currentLevel = 0;
  // Break current route in segments (levels)
  const routeSegments = route.name.split('.');

  // Set nesting level where to find routes for this routeNode
  if (routeNodeName === '') level = 0;
  else level = routeNodeName.split('.').length;
  if (level === 0 && routeNodeName !== '') level = 1;

  // Recurse until it gets the relevant portion of the routes obj or the component itself
  function getComponent(routesConfig) {
    for (const route of routesConfig) {
      const segment = routeSegments[currentLevel]; // going deeper every recursion
      if (route.name === segment) {

        if (currentLevel >= level) { // Exit condition
          return route.component;
        }
        else {
          currentLevel += 1;
          return getComponent(route.children);
        }
      }
    }
  }

  return getComponent(routesConfig);
}
