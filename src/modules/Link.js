import BaseLink from './BaseLink';
import withRoute from './withRoute';
import {PropTypes} from 'react';

const storeName = 'routerStore';

const Link = withRoute(BaseLink);

Link.wrappedComponent.propTypes ={};
Link.wrappedComponent.propTypes[storeName] = PropTypes.object.isRequired;

export default Link;
