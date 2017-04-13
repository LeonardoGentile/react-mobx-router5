import React from "react";
import BaseLink from './BaseLink';
import withRoute from './withRoute';

function withLink(BaseComponent, storeName='routerStore') {

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
    routeName:        React.PropTypes.string,
    routeParams:      React.PropTypes.object,
    routeOptions:     React.PropTypes.object,
    activeClassName:  React.PropTypes.string,
    linkClassName:    React.PropTypes.string,
    activeStrict:     React.PropTypes.bool,
    onClick:          React.PropTypes.func,
    activeRoute:      React.PropTypes.object
  };

  return withRoute(BaseComponentWrapper, storeName);
}

export default withLink;
