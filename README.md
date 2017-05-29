[![Build Status](https://travis-ci.org/LeonardoGentile/react-mobx-router5.svg?branch=master)](https://travis-ci.org/LeonardoGentile/react-mobx-router5)
[![Coverage Status](https://coveralls.io/repos/github/LeonardoGentile/react-mobx-router5/badge.svg?branch=master)](https://coveralls.io/github/LeonardoGentile/react-mobx-router5?branch=master)
[![license](https://img.shields.io/github/license/LeonardoGentile/react-mobx-router5.svg)](https://github.com/LeonardoGentile/react-mobx-router5/blob/master/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/react-mobx-router5.svg)](https://www.npmjs.com/package/react-mobx-router5)


# react-mobx-router5

> [Router5](http://router5.github.io/) integration with [mobx](https://mobx.js.org/) and [react](https://facebook.github.io/react/).

## Introduction
This package represents a routing alternative to react-router.  
This is especially useful if you already use [mobx](https://mobx.js.org/) and [mobx-react](https://github.com/mobxjs/mobx-react) in your react project.  

To make this work in your project you should use [router5](https://github.com/router5/router5) as a standalone routing library and 
the [mobx-router5](https://github.com/LeonardoGentile/mobx-router5) plugin 
which exposes the router5's state as mobx _observable_ variables.  

The React Components exported by this package uses [mobx-router5](https://github.com/LeonardoGentile/mobx-router5) as the source of truth. 
They _observe_ the mobx-router5 _observables_ and react when they change.
 
## Requirements

- __react >= 15.0.0__
- __mobx >= 3.1.0__
- __mobx-react >= 4.0.0__
- __router5 >= 4.0.0__
- __mobx-router5 >= 1.0.0__

These are considered `peerDependencies` that means they should exist in your installation, you should install them yourself to make this plugin work. 
The package won't install them as dependencies.

## Installation 

```bash
npm install react-mobx-router5
```

## Configuration
In you application entry point you should configure and instantiate a new `router` and a mobx-router5 `routerStore` as 
described in the [mobx-router5 documentation](https://github.com/LeonardoGentile/mobx-router5#how-to-use).

The `routerStore` instance is important as it exposes the router5
state as mobx observables. So the __routerStore__ is indeed the _source of truth_ for our components.
 
After the instantiation of the store we need to pass it to the components using the `mobx-react` [Provider](https://github.com/mobxjs/mobx-react#provider-and-inject) component. 
Internally the components exported by this package will use `@inject` to grab the `routerStore`.  

An example would make this more clear:

__stores.js__ (mobx stores)

```javascript
import tabStore from './TabStore';
import userStore from './UserStore';
import {RouterStore} from 'mobx-router5';

// Instantiate it directly or extend the class as you wish before invoking new
const routerStore = new RouterStore();

export {
  tabStore,
  userStore,
  routerStore
};
```

__create-router5.js__:  

```javascript
import {createRouter} from 'router5';
import loggerPlugin from 'router5/plugins/logger'; 
import browserPlugin from 'router5/plugins/browser';
import {mobxPlugin} from 'mobx-router5';
import routes from './routes';
import {routerStore} from './stores';

export default function configureRouter(useLoggerPlugin = false) {
  const router = createRouter(routes, {defaultRoute: 'home'})
    .usePlugin(mobxPlugin(routerStore)) // Important: pass the store to the plugin!
    .usePlugin(browserPlugin({useHash: true}));
  
  if (useLoggerPlugin) {
    router.usePlugin(loggerPlugin) ;
  }
  return router;
}
```

__app.js__:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'mobx-react';
import Layout from './components/Layout'
import * as stores from './stores'; //mobx stores
import createRouter from './create-router5';


// 'true' for using the useLoggerPlugin (for debug)
const router = createRouter(true);

// Provider will add all the mobx stores (including the routerStore) in context.
const wrappedApp = (
  <Provider {...stores } >
    <Layout/>
  </Provider>
);

// Renders the entire app when the router starts
router.start((err, state) => {
  ReactDOM.render(
    wrappedApp,
    document.getElementById('app')
  );
});

```

From now on you can use all the components and HOC exported by this package without further steps. 
The components will always be in sync with the `routerStore` internal observables and react when they will change.

## What does this package export?

- `routeNode`: higher-order component
- `withRoute`: higher-order component
- `BaseLink`: component
- `Link`: component
- `withLink`: higher-order component
- `NavLink`: component component
- `getComponent`: helper function 
- `Route`: Component

#### routeNode - HOC

**Description**   

Function that generates an higher-order component to wrap a *route node* component.  
This function should be used to *decorate* **route nodes** components, that is, those routes having children routes, see [router5 documentation](http://router5.github.io/docs/understanding-router5.html) on these concepts if you are not familiar with them.   
 
**Signature**  

 `routeNode(nodeName, storeName='routerStore')`
 
**Params**  

- `nodeName`: the route name of the component to wrap (`''` if root node)
- `storeName` (optional, __default__: `routerStore`): the RouterStore name if it differs from the default

**Return**  
It returns a function `routeNodeWrapper(RouteSegment)`. This function in turn returns a `RouteNode` component, the actual HOC wrapper.

**Usage**   

Given for example a route name `'users'` associated with a component `UsersComp` having children routes `users.list` and `users.view` then the route `'users'` should be considered a *route node* for you application, and its associated component `UsersComp` should be the one responsible to re-render the components associated with its children routes. 

`const UsersCompNode = routeNode('users')(UsersComp)`;

The newly created `UsersCompNode` HOC is a *wrapper* around `UserComp` and will: 

 - pass the `routerStore`, `route`, `previousRoute` as props to the *wrapped* `UsersComp` component 
 - trigger a re-rendering of the wrapper and of the wrapped component only **when** the the **nodeName** (in this case `'users'`) is the correct **intersection node** for the current transition (see [understanding router5](http://router5.github.io/docs/understanding-router5.html))
 
**Example**

In the following example when navigating from `'users.list'` -> `'users.view'` then `'users'` is the **intersection node**.  
Wrapping the `UserComp` with `RouteNode` ensures that the during this transition the `UserComp` will re-render 
and so it will be able to determine which component to show (associated to one of its sub-routes).  
  
**Note**  
  
The logic on how to select and render the correct sub-component is up to you, in the example it is used a simple switch.  
See the [Rendering Routes](#rendering-routes) section below for a possible implementation. 
  
```javascript
import React from 'react';
import { routeNode } from 'react-mobx-router5';
import { UserView, UserList, NotFound } from './components';

function UsersComp(props) {
    const { previousRoute, route } = props;

    switch (route.name) {
        case 'users.list':
            return <UserList/>;
        case 'users.view':
            return <UserView/>;
        default:
            return <NotFound/>;
    };
}

export default routeNode('users')(UsersComp); 

```

#### withRoute - HOC

**Description**    

Function that generates an higher-order component to wrap any component that need to re-render on route changes.  

**Signature**  

`withRoute(BaseComponent, storeName='routerStore')`
  
**Params**
  
- `BaseComponent`: the component to be wrapped
- `storeName` (optional, __default__: `routerStore`): the RouterStore name if it differs from the default
 
  
**Return**  
  
It returns a `ComponentWithRoute` that wraps `BaseComponent`.


**Usage** 

`const MyCompWithRoute = withRoute(MyComp);`  
  
Any component wrapped by this HOC:
  
  - receives all the props passed to the wrapper
  - is injected with these extra props coming from **mobx-router5**: `routerStore`, `route`, `previousRoute`
  - is injected with these *computed* extra props: `isActive` and `className` (see below)
  - re-renders on any route change


**Injected computed props** (`isActive` and `className`)

Some special props passed to the wrapper are used to compute other extra props that will be injected in the wrapped component.

The following props are used to compute a **new prop** `isActive` (bool) injected into the wrapped `BaseComponent`:    

  - `routeName` (string): name of the route that should be associated with the `BaseComponent`
  - `routeParams` (obj) **default** `{}`: the route params  
  - `activeStrict` (bool) **default** `false`: whether to check if `routeName` is the active route, or part of the active route

  
Also if a `routeName` prop is passed then an `activeClassName` (default 'active') will be added to the `className` when the component is `isActive` and the **newly computed prop** `className` (string) is injected into the wrapped `BaseComponent`:

  - `className` (string) **default** `''`: prop forwarded 
  - `activeClassName` (string) **default** `'active'`: the name of the class to apply when the element is active

**Example**

In the following example the MyComp used within Container will re-render on any route change.   
  
When the current route is `home`:
  
- a className `'hello hyperactive'` will be applied
- the prop `isActive` will be `true` 
  
  
```javascript
// MyComp.jsx
import React from 'react';
import { withRoute } from 'react-mobx-router5';

function MyComp(props) {
	// these are injected by withRoute
    const { previousRoute, route, isActive, className } = props;
	
	return (
		<div className={className}>
			I am {isActive: 'active' ? 'inactive' } <br/>
			The current route is {route}
		</div>
	)	

}
export default withRoute(MyComp);
```

```javascript
// Container.jsx
import React from 'react';
import MyComp from './MyComp';

function Container(props) {
	return (
		<div>
			<MyComp
			  routeName='home'
			  className='hello'
			  activeClassName='hyperactive' />
		</div>
	)	

}
export default Container;
```
 
  
#### BaseLink - Component

**Description**
  
It generates an anchor `a` tag with `href` computed from `props.routeName`.  
**Note:** This component *won't re-render* on route change.

**Props**
  
In order to work it is **mandatory** to pass at least one of these props to the component:

  - `router={routerInstance}` the router5 instance object. 
  - `routerStore={routerStore}` the *mobx-router5* `routerStore`. If passed will take precedence over `router` prop
  - `onClick={onClickCB}` when passed the navigation will be prevented (the above 2 props become both unnecessary) and the `onClickCB` function will be executed instead.  

Props needed to compute the correct `href` (when passing either `router` or `routerStore`):

  - `routeName="home"` route to navigate to when the component is clicked
  - `routeParams={routeParamsObj}` *optional*, **default {}**
  - `routeOptions={routeOptionsObj}` *optional*, **default {}**

**Example**  
  

```javascript
import React from 'react';
import { BaseLink } from 'react-mobx-router5';

function logMeIn(e) {
  e.preventDefault();
  console.log('clicked');
}

function Menu(props) {
  return (
    <nav>
      <Link routerStore={props.routerStore} routeName='home' routeOptions={{reload: true}}>Home</Link>
      <Link router={props.router} routeName='home'>About</Link>
      <Link onClick={logMeIn} >Login</Link>
    </nav>
  );
}

export default Menu;
```
  
    
    
#### Link - Component

**Description**
  
The `Link` component is `BaseLink` and `withRoute` **composed together**.  
This means that `Link` will re-render on any route change and an 'active' class will be applied to it when 
the current route is `props.routeName`.

#### withLink - HOC

**Description**   

Function that generates a higher-order component to create custom wrappers around a `<BaseLink/>` component.  
Useful for creating any sort of wrappers that will be **aware of route changes**, for example for creating navigation menus.  

**Signature**  

`withLink(LinkWrapper, storeName='routerStore')` 
  
**Params**

- `LinkWrapper`: the component used to wrap the inner `BaseLink`
- `storeName` (optional, __default__: `routerStore`): the RouterStore name if it differs from the default
  
  
**Return**  

The function creates a new `WithLink` higher-order component that wraps the passed `LinkWrapper`.  
The `LinkWrapper` is in turn a wrapper around the `BaseLink`.   
This composed element is then passed to `withRoute(WithLink)`.   
The final returned component would then be a `ComponentWithRoute`

**Props**
  
The final composed component accepts all the props accepted by the `WithRoute` component with an extra special  
`linkClassName` prop.
  
All props passed to the composed component (including the one injected by `withRoute`) will be forwarded to the inner `BaseLink` except for `className`.   
In fact the (computed 'active') `className` will be applied to the `LinkWrapper` while the extra `linkClassName`  (unmodified) will be applied to the inner `BaseLink`.  

Also all the `children` of the final composed component will become children of the inner `BaseLink`. 
  
    
**Example**   
  
```javascript
const MyLinkWrapper = withLink('div');
```     

 - This produces a `div` that wraps a `BaseLink` component. Then this result is passed to `withRoute`.  
 - The `'active'` className will be applied to the `div` not the on `BaseLink` (so not on the generated `a`).  
 - If we pass an `linkClassName` then it will become the `className` of the inner `BaseLink` (so of the generated `a`)

See `NavLink`

### NavLink - Component

**Description**

The `NavLink` component is the `li` element and `withLink` composed together.

```javascript
const NavLink = withLink('li');
```

__Example__:

```javascript
import {NavLink} from 'react-mobx-router5'

function MyComponent(props) {
  return (
    <NavLink 
      className="hello" 
      linkClassName="goodbye"
      routeName="home">
      HOME
    </NavLink>
  )
}

```

Will produce something like this (pseudo-code):

```html
<li className={props.className} >
  <BaseLink { ...props } className={props.linkClassName} >
    {props.children}
  </BaseLink>
</li>

```
That is indeed very similar to what `Link` looks like, except this will apply the 'active' className to the `li` and the 
`linkClassName` to the internal `BaseLink` (and so to the generated an `a` tag)

----
  
## Routes Rendering
Quoting the [router5 documentation](http://router5.github.io/docs/understanding-router5.html):
> On a route change, you only need to re-render a portion of your app.
  
This is basically what `routeNode` is for: by wrapping a *node component* (a component associated with a route having children routes) we are telling to re-render only a portion of our app when there is a specific route change. 

At this point only the components wrapped with `RouteNode` are associated with some our app routes, so what about all the other components?
  
> [...] rather than the router updating the view, it is up to the view to listen / bind / subscribe to route changes in order to update itself.   
> [...] The router is unaware of your view and you need to bind your view to your router's state updates.  

 
In the above [routeNode section](#routenode---hoc) there is simple example where the sub-components of a RouteNode are selected with a simple switch statement. This is a possible implementation.   
  
In this section I present two (opinionated) personal implementations:
 - `getComponent` function helper
 - `Route` Component
  
Be warned:  

  - these are not the only ones, you are free to implement your own
  - hot reloading might not work
  - these implementations are optional, you can use this package without them


#### Routes configuration
For both solutions to work we need to use the router5' [Nested arrays of routes config](http://router5.github.io/docs/configuring-routes.html) introducing an additional `component` field for associating a component with a route.

**Example**
   

```javascript
//routes.js
import {Home} from './components/Home';
import {Index} from './components/Index';
import {Login} from './components/Login';
import Sections from './components/Nodes/Sections';
import Subsections from './components/Nodes/Subsections';

export default [
  // children of the root routeNode ''
  { name: 'home', path: '/', component: Home}, // Notice the extra `component` field
  { name: 'login', path: '/login', component: Login},
  { name: 'index', path: '/index/:id', component: Index},
  { name: 'section', path: '/section', component: Sections, children: [ 
    // children of 'section' routeNode
    { name: 'home', path: '/home', component: Home },
    { name: 'login', path: '/login', component: Login },
    { name: 'index', path: '/index/:id', component: Index },
    { name: 'subsection', path: '/subsection', component: Subsections, children: [
      // children of 'section.subsection' routeNode
      { name: 'home', path: '/home', component: Home },
      { name: 'login', path: '/login', component: Login },
      { name: 'index', path: '/index/:id', component: Index },
    ]}
  ]}
];

```
  
By associating a route with a component we might apparently break the router5's principle 
> The router is unaware of your view  

but as I will show this isn't true because the `component` field isn't used by the router but by our views!

  
#### getComponent - Helper function

**Description**   

When using the above routes configuration this helper is used for retrieving the correct component to render for a given `routeNode` and the a given `route`. This represents an alternative to the switch statement.
   
**Signature**  

`getComponent(route, routeNodeName, routesConfig)` 

**Params**

- `route`: either the `routerStore.route` __object__ or the _route name_ as a **string**. Usually it's the currently active route
- `routeNodeName`: the name of the route for the React component from where to re-render (transition node)
- `routesConfig`: nested routes configuration array (with an extra `component` field for each route)
    
**Return**  
  
It returns a `React.Component`: the component to be rendered extracted from the routes configuration for the given `route` and `routeNode` .   
  
**Example**

```javascript
//Main.jsx: the root routeNode ('')
import React, {createElement} from "react";
import {routeNode, getComponent} from "react-mobx-router5";
import routes from "../../routes";

class Main extends React.Component {
  render(){
    const { routerStore } = this.props;
    const currentRoute = routerStore.route; 
    // This will extract the correct component amongst the children of ''for the current route 
    // Notice that the ComponentToRender could also be another routeNode, for example `Section`
    const ComponentToRender = getComponent(currentRoute, '', routes);
	// Passing the params as prop to re-render if we remain on the same route but only change in params
    return createElement(ComponentToRender, {...currentRoute.params}); 
  }
}

// higher-order component to wrap a route node component.
export default routeNode('')(Main);
```
  
  
```javascript
//Section.jsx: the `section` routeNode
import React, {createElement} from "react";
import {routeNode, getComponent} from "react-mobx-router5";
import routes from "../../routes";

class Section extends React.Component {
  render(){
    const { routerStore } = this.props;
    const currentRoute = routerStore.route; 
    // This will extract the correct component amongst the children of 'section' for the current route
    // Notice that the ComponentToRender could also be another routeNode, for example `Subsection`
    const ComponentToRender = getComponent(currentRoute, 'section', routes);
    // Instead of passing the params we can pass the entire route given that when a param change also a route change (even if the same)
    return createElement(ComponentToRender, {route: currentRoute}); 
  }
}

// higher-order component to wrap a route node component.
export default routeNode('section')(Section);
```


#### Route - Component

If you observe the `getComponent` solution you might notice some repetition, that is you always need to grab the component to render and then renders it:

```
const ComponentToRender = getComponent(currentRoute, 'section', routes);
return createElement(ComponentToRender, {route}); 
```

The `Route` component does these two operations for you. 

**Description**
  
It fetch which component to render from the route configuration and renders it, additionally passing the `route` as prop to the generated component.
  

**Props**  
  
- `route`: the `routerStore.route` __object__. This is required or pass the routerStore instead
- `routerStore`: If you don't pass the current route then pass the router store and the component will grab routerStore.route for you
- `routeNodeName`: the name of the route for the React component from where to re-render (transition node)
- `routes`: nested routes configuration array (with an extra `component` field for each route)

**Example**  

```
//Main.jsx: the root routeNode ('')
import React, {createElement, Route} from "react";
import {routeNode, getComponent} from "react-mobx-router5";
import routes from "../../routes";

const routeNodeName = '';

class Main extends React.Component {
  render(){
	const route = this.props.routerStore.route;
	// The generated component will receive the `route` prop
    return <Route routes={routes} routeNodeName={routeNodeName} route={route} />;
  }
}

export default routeNode('')(Main);
```


### About PropTypes
The components are shipped with [prop-types](https://github.com/reactjs/prop-types) checks (`prop-types` is dependencies of this package).  
If you want to remove them from your build you could use [babel-plugin-transform-react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types). 

You could for example add this to your babel config:

```
"plugins": [
  ["transform-react-remove-prop-types", {
     "mode": "wrap"
   }]
]
```
or 

```
"plugins": [
  ["transform-react-remove-prop-types", {
     "mode": "remove",
     "removeImport": true
   }]
]
```
Check the [doc](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types#mode) of the plugin for choosing the correct configuration.


## Contributing
PR, suggestions and help is appreciated, please make sure to read the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

## Acknowledgments

- The structure and build process of this repo are based on [babel-starter-kit](https://github.com/kriasoft/babel-starter-kit)   
- I've taken the [react-router5](https://github.com/router5/react-router5) package as example for developing this one
- Thanks to egghead.io for the nice tips about open source development on their [free course](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github) 
- Thanks to [Olivier Tassinari](https://github.com/oliviertassinari) for the [fast fix](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types/issues/106) and suggestion needed by this package
- Special thanks to [Thomas Roch](https://github.com/troch) for the awesome [router5](https://github.com/router5/router5) ecosystem



