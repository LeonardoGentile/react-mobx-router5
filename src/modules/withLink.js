/**
 * HOC that creates custom wrappers around the BaseLink component
 *
 * The resulting composed element will passed to withRoute so that it will be aware
 * of route changes and apply an `active` className on the LinkWrapper (not on the BaseLink).
 * In practise the final component will be a <Link/> element wrapped with a LinkWrapper
 *
 * @param LinkWrapper - the component to be wrapped. This is supposed to be a DOM element: li, div, ectr
 * @param storeName - the mobx-router5 instance name. Default 'routerStore'
 * @returns {ComponentWithRoute}
 */
import React from 'react';
import PropTypes from 'prop-types';
import BaseLink from './BaseLink';
import withRoute from './withRoute';
import { getDisplayName } from "./utils";

function withLink(LinkWrapper, storeName='routerStore') {

  /***
   * HOC WithLink that wraps the LinkWrapper
   *
   * It receives all the props that LinkWrapper would receive in ComponentWithRoute
   * The only difference is that it only passes the className to the original LinkWrapper
   * All the other props will be passed to the inner BaseLink
   *
   * If a prop linkClassName is passed then it will be applied to the inner BaseLink
   * Note: the `active` class will be applied to the LinkWrapper, not the BaseLink
   */
  function WithLink(props) {
    return (
      <LinkWrapper className={props.className} >
        <BaseLink { ...props } className={props.linkClassName} >
          {props.children}
        </BaseLink>
      </LinkWrapper>
    );
  }

  WithLink.displayName = 'WithLink[' + getDisplayName(LinkWrapper) + ']';

  // All props passed from ComponentWithRoute
  WithLink.propTypes = {
    // forwarded
    routeOptions:     PropTypes.object,
    routeParams:      PropTypes.object,
    routeName:        PropTypes.string,
    onClick:          PropTypes.func,
    children:         PropTypes.node,
    // computed/injected
    route:            PropTypes.object,
    previousRoute:    PropTypes.object,
    className:        PropTypes.string,
    isActive:         PropTypes.bool,
    // special
    linkClassName:    PropTypes.string,
    // injected by ComponentWithRoute
    [storeName]:  PropTypes.object.isRequired
  };

  // Make the final result similar to a Link component (aware of route changes)
  return withRoute(WithLink, storeName);
}

export default withLink;
