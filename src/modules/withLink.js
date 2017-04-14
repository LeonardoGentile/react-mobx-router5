import React from "react";
import BaseLink from './BaseLink';
import withRoute from './withRoute';

/**
 * HOC that creates a new wrapper BaseComponentWrapper around BaseComponent
 *
 * It will then call withRoute
 * This is very similar to Link component.
 * It exists and differs from it only to change the structure of the wrapped elements
 * Useful for creating any sort of wrapper around a BaseLink component that will
 * be aware of route changes and apply an `active` className on the wrapper (not on the BaseLink)
 *
 * @param BaseComponent - the component to be wrapped. This is supposed to be a DOM element: li, div, ectr
 * @param storeName - the mobx-router5 instance name. Default 'routerStore'
 * @returns {ComponentWithRoute}
 */
function withLink(BaseComponent, storeName='routerStore') {

  /***
   * Wrapper BaseComponentWrapper around the BaseComponent
   *
   * It receives all the props that BaseComponent would receive in ComponentWithRoute
   * The only difference is that it only passes the className to the original BaseComponent
   * All the other props will be passed to the inner BaseLink
   *
   * If a prop linkClassName is passed then it will be applied to the inner BaseLink
   * Note: the `active` class will be applied to the BaseComponent, not the BaseLink
   */
  function BaseComponentWrapper(props) {
    return (
      <BaseComponent className={props.className} >
        <BaseLink { ...props } className={props.linkClassName} activeRoute={props.activeRoute}>
          {props.children}
        </BaseLink>
      </BaseComponent>
    )
  }

  BaseComponentWrapper.propTypes = {
    // Defaults
    activeClassName:  React.PropTypes.string,
    activeStrict:     React.PropTypes.bool,
    routeOptions:     React.PropTypes.object,
    routeParams:      React.PropTypes.object,
    // Optional
    linkClassName:    React.PropTypes.string,
    onClick:          React.PropTypes.func,
    routeName:        React.PropTypes.string,
    // passed to it from ComponentWithRoute
    activeRoute:      React.PropTypes.object
  };

  return withRoute(BaseComponentWrapper, storeName);
}

export default withLink;
