import PropTypes from 'prop-types';
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


  test('should not add the routerStore to the child props', () => {
    const tree = renderWithProvider(routerStore)(Child);
    const child = tree.find(Child);
    expect(child.props.routerStore).toBeUndefined();
  });

  test('should inject the routerStore to the @inject decorated component`s props', () => {
    ChildWithInjectedStore.wrappedComponent.propTypes = {
      routerStore: PropTypes.object.isRequired
    };
    const wrapper = renderWithProvider(routerStore)(ChildWithInjectedStore);
    const child = wrapper.find(ChildWithInjectedStore);
    expect(child.instance().wrappedInstance.props.routerStore).toBe(routerStore);
  });

  test('should not add the router instance to the injected routerStore prop when mobXPlugin is not used', () => {
    ChildWithInjectedStore.wrappedComponent.propTypes = {
      routerStore: PropTypes.object.isRequired
    };
    const wrapper = renderWithProvider(routerStore)(ChildWithInjectedStore);
    const child = wrapper.find(ChildWithInjectedStore);
    expect(child.instance().wrappedInstance.props.routerStore.router).toBeNull();
  });

  test('should add the router instance to the injected routerStore prop when mobxPlugin is used', () => {
    ChildWithInjectedStore.wrappedComponent.propTypes = {
      routerStore: PropTypes.object.isRequired
    };
    router.usePlugin(mobxPlugin(routerStore));
    const wrapper = renderWithProvider(routerStore)(ChildWithInjectedStore);
    const child = wrapper.find(ChildWithInjectedStore);
    expect(child.instance().wrappedInstance.props.routerStore.router).toBe(router);
  });
});
