import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {createElement} from 'react';
import {getComponent} from './utils';


/**
 * RouteView component: it should be used inside a routeNode component
 *
 * It select and render the correct component associated with the current route for the given routeNodeName
 *
 * @return {object|null}
 */
function RouteView(props) {
  const {route, routeNodeName, routes, ...passThroughProps } = props;
  let currentRoute = route;

  if (!currentRoute) {
    throw new Error('RouteView component requires a route prop');
  }
  const FetchedComponent = getComponent(currentRoute, routeNodeName, routes); // getComponent may throw
  // Add `{key: route.meta.id}` to props for a full unmount/mount
  return createElement(FetchedComponent, {...passThroughProps, route});
}

RouteView.displayName = 'RouteView';

RouteView.propTypes = {
  routes: PropTypes.array.isRequired,
  routeNodeName: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired
};




class ErrorBoundRouteView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error, info) {
    const currentRoute = this.props.route;
    // Display fallback UI
    this.setState({ hasError: true });

    console.error(`RouteView: it was not possible to select the correct view for the current route '${currentRoute.name}' having params: `);
    // This outputs an object on the browser console you can click through
    console.dir(currentRoute.params);
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>{this.props.errorMessage || 'Something went wrong.'}</h1>;
    }
    const {errorMessage, ...passThroughProps } = this.props;
    return <RouteView {...passThroughProps} />
  }
}

ErrorBoundRouteView.propTypes = {
  routes: PropTypes.array.isRequired,
  routeNodeName: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
  errorMessage: PropTypes.string
};


export default ErrorBoundRouteView;

