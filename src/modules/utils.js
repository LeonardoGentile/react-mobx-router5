export const getDisplayName = component => component.displayName || component.name || 'Component';

export const ifNot = (condition, errorMessage) => {
    if (!condition) throw new Error(errorMessage);
};

/**
 * Return a component to be rendered by a routeNode for the current route
 * extracted from the custom (nested) routes definition (with 'component' field)
 * @param {array} routes - nested routes def (with 'component' field)
 * @param {object} routerStore - the mobx-router store. Used for getting the current route
 * @param {string} routeNode - the name of the route for the React component from where to re-render (transition node)
 * @returns {React.Component} - the component to be rendered
 */
export function getComponentFromRoutes(routes, routerStore, routeNode) {
  let level = 0;
  let currentLevel = 0;
  // Break current route in segments (levels)
  const routeSegments = routerStore.route.name.split('.');

  // Set nesting level where to find routes for this routeNode
  if (routeNode === '') level = 0;
  else level = routeNode.split('.').length;
  if (level === 0 && routeNode !== '') level = 1;

  // Recurse until it gets the relevant portion of the routes obj or the component itself
  function getComponent(routesObj) {
    for(const route of routesObj) {
      const segment = routeSegments[currentLevel]; // going deeper every recursion
      if(route.name === segment) {

        if(currentLevel >= level) { // Exit condition
          return route.component;
        }
        else {
          currentLevel += 1;
          return getComponent(route.children);
        }
      }
    }
  }
  return getComponent(routes);
}
