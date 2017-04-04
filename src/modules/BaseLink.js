import React, { Component } from 'react';
import { inject } from 'mobx-react';

@inject('routerStore')
class BaseLink extends Component {

  constructor(props, context) {
    super(props, context);

    this.routerStore = props.routerStore || null;

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

    // Why?
    this.state = { active: this.isActive() };
  }

  buildUrl(routeName, routeParams) {
    // If browser plugin is active
    if (this.router.buildUrl) {
      return this.router.buildUrl(routeName, routeParams);
    }

    return this.router.buildPath(routeName, routeParams);
  }

  isActive() {
    return this.router.isActive(this.props.routeName, this.props.routeParams, this.props.activeStrict);
  }

  clickHandler(evt) {
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
    const {routeName, routeParams, className, activeClassName, children} = this.props;

    const active = this.isActive();
    const href = this.buildUrl(routeName, routeParams);
    const linkclassName = (className ? className.split(' ') : [])
    .concat(active ? [activeClassName] : []).join(' ');

    const onClick = this.clickHandler;

    return React.createElement('a', { href: href, className: linkclassName, onClick: onClick }, children);
  }
}


BaseLink.propTypes = {
  routeName: React.PropTypes.string.isRequired,
  // routerStore: React.PropTypes.object.isRequired
};

BaseLink.wrappedComponent.contextTypes = {
  routerStore: React.PropTypes.object
};


//     routeParams:     React.PropTypes.object,
//     routeOptions:    React.PropTypes.object,
//     activeClassName: React.PropTypes.string,
//     activeStrict:    React.PropTypes.bool,
//     onClick:         React.PropTypes.func
// };


BaseLink.defaultProps = {
  activeClassName: 'active',
  activeStrict: false,
  routeParams: {},
  routeOptions: {}
};

export default BaseLink;
