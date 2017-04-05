import React, { Component } from 'react';
import { inject } from 'mobx-react';

class BaseLink extends Component {

  constructor(props, context) {
    super(props, context);


    this.routerStore = props.routerStore;

    // Get the router instance from the props (when explicitly passed) or from routerStore
    // It is passed to props for example when using withRoute wrapper
    if (this.routerStore) {
      this.router = this.routerStore.router || null;
    }
    // get the router instance from the props (when explicitly passed) or from routerStore
    else {
      this.router = this.props.router || null;
    }

    if (!this.router) {
      console.error('[mobx-router5-react][BaseLink] missing router instance props');
    }

    if (!this.router.hasPlugin('BROWSER_PLUGIN')) {
      console.error('[mobx-router5-react][BaseLink] missing browser plugin, href might be build incorrectly');
    }

    this.isActive = this.isActive.bind(this);
    this.clickHandler = this.clickHandler.bind(this);

  }

  buildUrl(routeName, routeParams) {
    // If browser plugin is active
    if (this.router.buildUrl) {
      return this.router.buildUrl(routeName, routeParams);
    }

    return this.router.buildPath(routeName, routeParams);
  }

  isActive(routeName, routeParams, activeStrict) {
    return this.router.isActive(routeName, routeParams, activeStrict);
  }

  clickHandler(evt) {
    // If this.onClick is passed
    // it will be executed instead of navigating to the route
    if (this.props.onClick) {
      this.props.onClick(evt);

      if (evt.defaultPrevented) {
        return;
      }
    }

    const comboKey = evt.metaKey || evt.altKey || evt.ctrlKey || evt.shiftKey;

    if (evt.button === 0 && !comboKey) {
      evt.preventDefault();
      this.router.navigate(this.props.to, this.props.routeParams, this.props.routeOptions);
    }
  }

  render() {
    // stupid trick to force re-rendering when decorating with @observer
    if (this.routerStore) {
      const route = this.routerStore.route
    }
    const {to, routeParams, className, activeClassName, children, activeStrict} = this.props;
    const active = this.isActive(to, routeParams, activeStrict);
    const href = this.buildUrl(to, routeParams);
    const linkClassName = (className ? className.split(' ') : [])
    .concat(active ? [activeClassName] : []).join(' ');

    const onClick = this.clickHandler;

    return React.createElement('a', { href: href, className: linkClassName, onClick: onClick }, children);
  }
}


BaseLink.propTypes = {
  to:               React.PropTypes.string, // not required because of onClick  could be passed instead
  router:           React.PropTypes.object, // when we don't inject the routerStore then we need the router
  routeParams:      React.PropTypes.object,
  routeOptions:     React.PropTypes.object,
  activeClassName:  React.PropTypes.string,
  activeStrict:     React.PropTypes.bool,
  onClick:          React.PropTypes.func
};


BaseLink.defaultProps = {
  activeClassName: 'active',
  activeStrict: false,
  routeParams: {},
  routeOptions: {}
};

export default BaseLink;
