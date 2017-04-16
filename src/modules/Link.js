import BaseLink from './BaseLink';
import withRoute from './withRoute';
import {PropTypes} from 'react';

const storeName = 'routerStore';

const Link = withRoute(BaseLink);

// passed to it from ComponentWithRoute
Link.wrappedComponent.propTypes ={
  // Both could be null or object
  route:            PropTypes.object,
  previousRoute:    PropTypes.object
};
Link.wrappedComponent.propTypes[storeName] = PropTypes.object.isRequired;

export default Link;
