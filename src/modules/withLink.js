import React, {PropTypes} from "react";
import BaseLink from './BaseLink';
import withRoute from './withRoute';

/**
 * HOC that creates a new wrapper BaseComponentWrapper around BaseComponent, then passing it to withRoute HOC
 *
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
        <BaseLink { ...props } className={props.linkClassName} >
          {props.children}
        </BaseLink>
      </BaseComponent>
    )
  }

  // All props passed from ComponentWithRoute
  BaseComponentWrapper.propTypes = {
    // Extra (for re-rendering) injected to it
    route:            PropTypes.object,
    previousRoute:    PropTypes.object,
    // Defaults or defined forwarded to it
    routeOptions:     PropTypes.object,
    routeParams:      PropTypes.object,
    // Optional forwarded to it
    linkClassName:    PropTypes.string,
    onClick:          PropTypes.func,
    routeName:        PropTypes.string,
    // Computed, injected to it
    className:        PropTypes.string
  };
  // passed to it from ComponentWithRoute
  BaseComponentWrapper.propTypes[storeName] = PropTypes.object.isRequired;


  return withRoute(BaseComponentWrapper, storeName);
}

export default withLink;
