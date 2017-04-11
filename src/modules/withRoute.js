import React, {Component, createElement} from 'react';
import { ifNot, getDisplayName} from './utils';
import { autorun } from 'mobx';
import { inject, observer } from 'mobx-react';


/**
 * HOC withRoute
 * It creates a new wrapper component injecting the mobx routerStore and decorating it with @observer
 * Any route changes will trigger a re-rendering of the wrapper and so of its wrapped component and children.
 * The returned component ComponentWithRoute accepts all the props also accepted by the BaseLink component.
 *
 * If we pass prop `routeName` (and optionally other router options) to the component returned by the HOC
 * then an activeClass will be applied for the wrapped component (any type) if the `activeRoute` == `props.routeName`
 *
 * If LinkComponent is not null when  creating the HOC then it will be passed as the first child of the wrapped component and all props passed to it.
 *  In this case the activeClass will be applied to the BaseComponent and not LinkComponent.
 *  This is particularly useful when we want to create a wrapper around a BaseLink/Link component, see `withLink`
 *
 * @param BaseComponent - the component to be wrapped
 * @param storeName - the mobx-router5 instance name. default 'routerStore'
 * @param LinkComponent - component to be passed as first child of the wrapped component (see withLink) and pass all the props to it.
 * @returns {ComponentWithRoute}
 */
function withRoute(BaseComponent, storeName='routerStore', LinkComponent=null) {

  @inject(storeName)
  @observer
  class ComponentWithRoute extends Component {
    constructor(props, context) {
      super(props, context);

      this.routerStore = props[storeName];
      this.router = this.routerStore.router;

      this.isActive = this.isActive.bind(this);
      this.computeClassName = this.computeClassName.bind(this);
    }

    componentDidMount() {
      // TODO: here or in constructor?
      ifNot(
        this.router && this.router.hasPlugin('MOBX_PLUGIN'),
        '[react-mobx-router5][withRoute] missing mobx plugin'
      );
    }

    isActive(routeName, routeParams, activeStrict) {
      return this.router.isActive(routeName, routeParams, activeStrict);
    }

    computeClassName(className, activeClassName, active) {
      return (className ? className.split(' ') : [])
        .concat(active ? [activeClassName] : []).join(' ');
    }

    render() {
      ifNot(
        !this.props.activeRoute,
        '[react-mobx-router5][withRoute] prop names `activeRoute` is reserved.'
      );

      // stupid trick to force re-rendering when decorating with @observer
      let activeRoute = null;
      if (this.routerStore) {
        activeRoute = this.routerStore.route;
      }
      const {routeName, routeParams, activeStrict, className, activeClassName } = this.props;

      let currentClassName = className || '';
      if (this.props.routeName) {
        const active = this.isActive(routeName, routeParams, activeStrict);
        currentClassName = this.computeClassName(className, activeClassName, active);
      }

      // Special case used for generating component similar to NavLink (see withLink)
      if (LinkComponent) {
        const props = {...this.props, className: this.props.linkClassName };
        return (
          <BaseComponent className={currentClassName} activeRoute={activeRoute}>
            <LinkComponent { ...props } >
              {this.props.children}
            </LinkComponent>
          </BaseComponent>
        )
      }
      else {
        return (
          <BaseComponent {...this.props} className={currentClassName} activeRoute={activeRoute}>
            {this.props.children}
          </BaseComponent>
        )
      }
    }
  }

  ComponentWithRoute.displayName = 'WithRoute[' + getDisplayName(BaseComponent) + ']';

  ComponentWithRoute.propTypes = {
    routeName:        React.PropTypes.string,
    routeParams:      React.PropTypes.object,
    routeOptions:     React.PropTypes.object,
    activeClassName:  React.PropTypes.string,
    linkClassName:    React.PropTypes.string,
    activeStrict:     React.PropTypes.bool,
    onClick:          React.PropTypes.func
  };

  ComponentWithRoute.defaultProps = {
    activeClassName: 'active',
    activeStrict: false,
    routeOptions: {},
    routeParams: {}
  };

  return ComponentWithRoute;
}

export default withRoute;
