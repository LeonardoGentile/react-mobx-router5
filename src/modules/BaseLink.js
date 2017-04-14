/**
 * Basic link component: it generates an anchor tag with href computed from props.routeName.
 * This component won't re-render on route change
 *
 * The props.router is required (when using navigation). If the component will be decorated with @inject('routerStore') then it is optional.
 * If props.onClick is passed then the navigation won't happen and the callback will be executed instead.
 *
 * Usage:
 * `<BaseLink
 *    router={router5Instance}        // optional/required: when we don't inject the routerStore then we need to pass the router explicitly. If we don't use navigation then not required.
 *    routeName="home"                // optional/required: route to navigate to. When onClick is passed we don't need it
 *    routeParams={routeParamsObj}    // optional, default {}
 *    routeOptions={routeOptionsObj}  // optional, default {}
 *    activeClassName="activeClass"   // optional, default "active"
 *    activeStrict={false}            // optional, default false
 *    onClick={onClickCB}             // optional, when passe the navigation will be prevented and the onClickCB will be executed instead
 */
import React, {Component} from "react";
import {ifNot} from "./utils";

class BaseLink extends Component {

  constructor(props) {
    super(props);

    // Get the router instance from the props (when explicitly passed) or from routerStore
    // It is passed to props for example when using withRoute wrapper
    this.routerStore = props.routerStore;
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
      '[react-mobx-router5][BaseLink] missing browser plugin, href might be build incorrectly'
    );

    // Bindings
    this.clickHandler = this.clickHandler.bind(this);
  }

  buildUrl(routeName, routeParams) {
    if (this.router) {
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
    const {routeName, routeParams, className } = this.props;

    const href = this.buildUrl(routeName, routeParams);
    const onClick = this.clickHandler;
    return React.createElement('a', { href: href, className: className, onClick: onClick}, this.props.children);
  }
}

BaseLink.displayName = 'BaseLink';

BaseLink.defaultProps = {
  activeClassName: 'active',
  routeParams: {},
  routeOptions: {}
};

BaseLink.propTypes = {
  // Defaults
  routeOptions:     React.PropTypes.object,
  routeParams:      React.PropTypes.object,
  // Optional
  router:           React.PropTypes.object, // when we don't pass/inject the routerStore then we need the router
  // TODO: this could a different name
  // TODO: use the wrappedComponent.propTypes when using @inject
  // routerStore:      React.PropTypes.object,
  routeName:        React.PropTypes.string, // not required because of onClick  could be passed instead
  onClick:          React.PropTypes.func,
};

export default BaseLink;
