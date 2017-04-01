
# mobx-router5

## Warning
This is an early work-in-progress.
This is not published on npm yet.

## Usage

```javascript 
import createRouter from 'router5';
import loggerPlugin from 'router5/plugins/logger';
import listenersPlugin from 'router5/plugins/listeners';
import browserPlugin from 'router5/plugins/browser';
import routes from './routes';
  
import mobxPlugin from 'mobx-router5/mobxPlugin';
import RouterStore from 'mobx-router5/RouterStore';
  
// I instantiate it here because we could extend the class before invoking new
const routerStore = new RouterStore();

const routerOptions = {
  defaultRoute: 'home',
  strictQueryParams: true
};


export default function configureRouter(useListenersPlugin = false) {
  const router = createRouter(routes, routerOptions)
    // Plugins
    .usePlugin(loggerPlugin)
    .usePlugin(mobxPlugin(routerStore, {storeNavigation: true}))
    .usePlugin(browserPlugin({
      useHash: true
    }));

  if (useListenersPlugin) {
    router.usePlugin(listenersPlugin());
  }

  return router;
}
```

## Actions
The routerStore instance expose these actions/handlers automatically invoked by the plugin on transition Start/Success/Error.

- onTransitionStart(route, previousRoute)
- onTransitionSuccess(route, previousRoute)
- onTransitionError(route, previousRoute, transitionError)

This ensure that the observables are always up-to-date with the current route:

- @observable route 
- @observable previousRoute
- @observable transitionRoute
- @observable transitionError

To be called manually (todo)
- clearErrors()

### Manual actions (optional)
Only available if we pass the option `storeNavigation: true` on plugin creation.

```
.usePlugin(mobxPlugin(routerStore, {storeNavigation: true})
```

In this case when the plugin is create it will use the `setRouter` method of the store to pass in the router so that router methods can be used directly.  

- navigateTo(routeName, routeParams = {}, routeOptions = {})
- cancelTransition()
- canActivate(routeName, true | false)
- canDeactivate(routeName, true | false)

If you use react and an HOC component like `RouterProvider` to inject the router instance into your components context this is not necessary because you can access the router methods directly.
