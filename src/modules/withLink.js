import { inject, observer } from 'mobx-react';
import BaseLink from './BaseLink';
import withRoute from './withRoute';

function withLink(BaseComponent, activateClass=false, storeName='routerStore') {
  return withRoute(BaseComponent, activateClass, storeName, BaseLink);
}

export default withLink;
