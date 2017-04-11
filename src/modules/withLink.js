import BaseLink from './BaseLink';
import withRoute from './withRoute';

function withLink(BaseComponent, storeName='routerStore') {
  return withRoute(BaseComponent, storeName, BaseLink);
}

export default withLink;
