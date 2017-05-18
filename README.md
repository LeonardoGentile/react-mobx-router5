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
- `NavLink`: component higher-order component
- `getComponent`: helper function 

#### routeNode - HOC

**Description**   

Function that generates a higher-order component to wrap a *route node* component.  
This function should be used to decorate route nodes components, that is those having children routes, see router5 documentation on these concepts if you are not familiar with them. 
 
**Signature**  

 `routeNode(nodeName, storeName='routerStore')`
 
**Params**  

- `nodeName`: the route name of the component to wrap (`''` if root node)
- `storeName` (optional, __defult__: `routerStore`): the RouterStore name if it differs from the default

**Return**  
It returns a function `routeNodeWrapper(RouteSegment)`. This function in turn returns a `RouteNode` component.

**Usage**   

Given for example a route name `'users'` associated with a component `UsersComp` having children routes `users.list` and `users.view` then the component `UsersComp` should be considered a *route node* for you application, in other words the one responsible to re-render the components associated with its children routes. 

`const UsersCompNode = routeNode('users')(UsersComp)`;

The newly created `UsersCompNode` HOC is a *wrapper* around `UserComp` and will: 

 - pass the `routerStore`, `route`, `previousRoute` as props to the *wrapped* `UsersComp` component 
 - trigger a re-rendering of the wrapper and of the wrapped component only **when** the the **nodeName** (in this case `'users'`) is the correct **intersection node** for the current transition (see [understanding router5](http://router5.github.io/docs/understanding-router5.html))
 
**Example**

In the following example when navigating from `'users.list'` -> `'users.view'` then `'users'` is the **intersection node**.  
Wrapping the `UserComp` with `routeNode` ensures that the during this transition the `UserComp` will re-render 
and so it is able to determine which component to show (associated to its sub-routes).  
  
**Note**  
  
The logic on how to select and render the correct sub-component it's up to you, in the example it is used a simple switch.  
See the [getComponent](#getcomponent---helper-function) below for my personal implementation. 
  
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

`withRoute(BaseComponent, storeName = 'routerStore')`
  
**Params**
  
- `BaseComponent` the component to be wrapped
- `storeName` __optional__ the mobx-router5 store instance name. Default 'routerStore'
  
**Return**  
It returns a `ComponentWithRoute` component that wraps `BaseComponent`.
  
**Usage** 

This function should be used for any component that need to trigger a new rendering anytime the route changes.  

`const MyCompWithRoute = withRoute(MyComp);`  


Any component wrapped by this HOC:
  
  - receives all the props passed to the wrapper
  - is injected with these extra props: `routerStore`, `route`, `previousRoute`, `isActive`
  - re-renders on any route change


**Injected props** (`isActive` and `className`)

Some special props passed to the wrapper are used to compute other extra props that will be injected in the wrapped component.

The following props are used to compute a **new prop** `isActive` (bool) injected into the wrapped `BaseComponent`:    

  - `routeName` (string): name of the route that should be associated with the `BaseComponent`
  - `routeParams` (obj) **default** `{}`: the route params  
  - `activeStrict` (bool) **default** `false`: whether to check if `routeName` is the active route, or part of the active route


<!--Also these two props have a special meaning:-->

Also if a `routeName` prop is passed then an `activeClassName` will be added to the `className` when the component is `isActive` and the **newly computed prop** `className` (string) is injected into the wrapped `BaseComponent`:

  - `className` (string) **default** `''`: prop forwarded 
  - `activeClassName` (string) **default** `'active'`: the name of the class to apply when the element is active


  
#### BaseLink - Component

**Description**
  
It generates an anchor `a` tag with `href` computed from `props.routeName`.  
This component *won't re-render* on route change.

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
  
    
    
#### Link - Component (to Complete)

__The `Link` component is `BaseLink` and `withRoute` composed together__.  
This means that `Link` will re-render on any route change and an 'active' class will be applied to it when 
the current route is == `props.routeName`.

#### withLink - HOC

**Description**   

Function that generates a higher-order component to create custom wrapper around a `<Link/>` component.  

**Signature**  

`withLink(BaseComponent, storeName='routerStore')`

**Return**  

higher-order component that wraps a `BaseComponent` then passes it to `withRoute` HOC. 

- `BaseComponent` the component to wrap
- `storeName` __optional__ the mobx-router5 store instance name. Default 'routerStore'

It create and **returns** a new `ComponentWithRoute` that wraps a `BaseComponent`.

This is very similar to `Link` component but it differs from it only to change the structure of the wrapped elements. 

Useful for creating any sort of wrapper around a `BaseLink` component that will be aware of route changes 
and apply an 'active' `className` on the wrapper (not on the BaseLink).

**Example:**   

```javascript
const MyLinkWrapper = withLink('div');
```     

 - This produces a `div` that wraps a `BaseLink` component. Then this result is passed to `withRoute`.  
 - The `'active'` className will be applied to the `div` not the on `BaseLink` (and so the generated `a`).  
 - If we pass an `linkClassName` then it will become the `className` of the inner `BaseLink`

See `NavLink`

### NavLink component

__The `NavLink` component is the `li` element and `withLink` composed together__.

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

### getComponent - Helper function

Description: Optional helper function not strictly related to react-mobx-router5.    

*getComponent(route, routeNodeName, routesConfig)*   

params:

- route: either the `routerStore.route` __object__ or the _route name_ as a **string**. Usually it's the currently active route
- routeNodeName: the name of the route for the React component from where to re-render (transition node)
- routesConfig: nested routes configuration array (with an extra `component` field for each route)



It **returns** a `React.Component`: the component to be rendered for the given route and routeNode extracted from the routes configuration. 

This is an opinionated helper for lazy a**es like me that do not want to use the switch 
statement inside the routeNode components as shown above.   

Despite the router5's author recommends not to store components's references in the routes configuration 
I do it anyway because I like to have the whole routes/components configuration in one place. This helper is for retrieving the correct component to render from the routes config for a given routeNode and the current route.
 
__routes.js__:

```javascript
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

__Main.jsx__: the root routeNode ('')

```javascript
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
    return createElement(ComponentToRender, {...route.params }); 
  }
}

// higher-order component to wrap a route node component.
export default routeNode('')(Main);
```

__Section.jsx__: the `section` routeNode

```javascript
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
    return createElement(ComponentToRender, {...route.params }); 
  }
}

// higher-order component to wrap a route node component.
export default routeNode('section')(Section);
```



## About PropTypes
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


## Acknowledgments

- The structure and build process of this repo are based on [babel-starter-kit](https://github.com/kriasoft/babel-starter-kit)   
- I've taken the [react-router5](https://github.com/router5/react-router5) package as example for developing this one
- Thanks to egghead.io for the nice tips about open source development on their [free course](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github) 
- Thanks to [Olivier Tassinari](https://github.com/oliviertassinari) for the [fast fix](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types/issues/106) and suggestion needed by this package
- Special thanks to [Thomas Roch](https://github.com/troch) for the awesome [router5](https://github.com/router5/router5) ecosystem



