import { PropTypes } from 'react';
import { findRenderedComponentWithType } from 'react-addons-test-utils';
import { expect } from 'chai';
import { mobxPlugin, RouterStore } from 'mobx-router5';
import { inject } from 'mobx-react';
import { Child, createTestRouter, renderWithProvider } from './utils/test-utils';


describe('Mobx-react Provider/Inject-ing routerStore', () => {
  let router;
  let routerStore;
  let ChildWithInjectedStore;

  beforeEach(function () {
    router = createTestRouter();
    routerStore = new RouterStore();
    ChildWithInjectedStore = inject('routerStore')(Child);
  });


  it('should not add the routerStore to the child props', () => {
    const tree = renderWithProvider(routerStore)(Child);
    const child = findRenderedComponentWithType(tree, Child);
    expect(child.props.routerStore).to.be.undefined;
  });

  it('should inject the routerStore to the @inject decorated component`s props', () => {
    ChildWithInjectedStore.wrappedComponent.propTypes = {
      routerStore: PropTypes.object.isRequired
    };
    const tree = renderWithProvider(routerStore)(ChildWithInjectedStore);
    const child = findRenderedComponentWithType(tree, ChildWithInjectedStore);
    expect(child.wrappedInstance.props.routerStore).to.equal(routerStore);
  });

  it('should not add the router instance to the injected routerStore prop when mobXPlugin is not used', () => {
    ChildWithInjectedStore.wrappedComponent.propTypes = {
      routerStore: PropTypes.object.isRequired
    };
    const tree = renderWithProvider(routerStore)(ChildWithInjectedStore);
    const child = findRenderedComponentWithType(tree, ChildWithInjectedStore);
    expect(child.wrappedInstance.props.routerStore.router).to.be.null;
  });

  it('should add the router instance to the injected routerStore prop when mobxPlugin is used', () => {
    ChildWithInjectedStore.wrappedComponent.propTypes = {
      routerStore: PropTypes.object.isRequired
    };
    router.usePlugin(mobxPlugin(routerStore));
    const tree = renderWithProvider(routerStore)(ChildWithInjectedStore);
    const child = findRenderedComponentWithType(tree, ChildWithInjectedStore);
    expect(child.wrappedInstance.props.routerStore.router).to.equal(router);
  });
});
