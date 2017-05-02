import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ifNot } from './utils';

// TODO
const storeName = 'routerStore';

/**
 * BaseLink component: it generates an anchor tag with href computed from props.routeName.
 *
 * This component won't re-render on route change
 *
 * The props `router` or `routerStore` (if decorated with @inject) are required only if props `routeName` is also passed.
 * If props `onClick` is passed then the navigation won't happen and the callback will be executed instead.
 *
 * Usage:
 * `<BaseLink
 *    router={routerInstance}         // optional/required: when we don't inject the routerStore then we need to pass the router explicitly.
 *                                    // If we don't use navigation then it's not required.
 *    routerStore={routerStore}       // optional/required: as above but could be @inject-ed or passed as prop
 *    routeName="home"                // optional/required: route to navigate to. When onClick is passed we don't need it
 *    routeParams={routeParamsObj}    // optional, default {}
 *    routeOptions={routeOptionsObj}  // optional, default {}
 *    // NOT USED
 *    // activeClassName="activeClass"   // optional, default "active"
 *    activeStrict={false}            // optional, default false
 *    onClick={onClickCB}             // optional, when passed the navigation will be prevented and the onClickCB will be executed instead
 */
class BaseLink extends Component {

  constructor(props) {
    super(props);

    // Get the router instance from the props (when explicitly passed) or from routerStore
    // It is passed to props for example when using withRoute wrapper
    this.routerStore = props[storeName];
    if (this.routerStore) {
      this.router = this.routerStore.router || null;
    }
    else {
      this.router = props.router || null;
    }

    ifNot(
      !props.routeName || this.router,
      '[react-mobx-router5][BaseLink] missing router instance'
    );

    ifNot(
      !this.router || this.router.hasPlugin('BROWSER_PLUGIN'),
      '[react-mobx-router5][BaseLink] missing browser plugin, href might build incorrectly'
    );

    // Bindings
    this.clickHandler = this.clickHandler.bind(this);
  }

  buildUrl(routeName, routeParams) {
    if (routeName && this.router) {
      // If browser plugin is active
      if (this.router.buildUrl) {
        return this.router.buildUrl(routeName, routeParams);
      }
      return this.router.buildPath(routeName, routeParams);
    }
    return null;
  }

  clickHandler(evt) {
    // If props onClick is passed it will be executed
    // instead of navigating to the route
    if (this.props.onClick) {
      this.props.onClick(evt);

      if (evt.defaultPrevented) {
        return;
      }
    }

    const comboKey = evt.metaKey || evt.altKey || evt.ctrlKey || evt.shiftKey;

    if (evt.button === 0 && !comboKey) {
      evt.preventDefault();
      this.router.navigate(this.props.routeName, this.props.routeParams, this.props.routeOptions);
    }
  }

  render() {
    const {routeName, routeParams, className} = this.props;

    const href = this.buildUrl(routeName, routeParams);
    const onClick = this.clickHandler;
    return React.createElement('a', {href: href, className: className, onClick: onClick}, this.props.children);
  }
}

BaseLink.displayName = 'BaseLink';

BaseLink.defaultProps = {
  routeParams: {},
  routeOptions: {}
};

BaseLink.propTypes = {
  // Defaults
  routeOptions: PropTypes.object,
  routeParams: PropTypes.object,
  // Optional
  router: PropTypes.object, // when we don't pass/inject the routerStore then we need the router
  routeName: PropTypes.string, // not required because of onClick  could be passed instead
  onClick: PropTypes.func,
  className: PropTypes.string,  // could be passed directly or forwarded (computed) from withRoute/withLink
  children: PropTypes.node
};

// If used withRoute or withLink (Optional)
//============================================
BaseLink.propTypes[storeName] = PropTypes.object;
// Extra (for re-rendering) injected to it
BaseLink.propTypes['route'] = PropTypes.object;
BaseLink.propTypes['previousRoute'] = PropTypes.object;

export default BaseLink;
