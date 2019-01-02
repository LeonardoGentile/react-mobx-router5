import React from 'react';
import {mount} from 'enzyme';
import {mobxPlugin, RouterStore} from 'mobx-router5';
import {createTestRouter, FnComp} from './utils/test-utils';
import routeNode from '../src/modules/routeNode';
import {spy} from 'sinon';


describe('routeNode hoc', () => {
  let router;
  let routerStore;
  let NodeComp;

  beforeEach(() => {
    router = createTestRouter();
    routerStore = new RouterStore();
    router.usePlugin(mobxPlugin(routerStore));
    NodeComp = routeNode('')(FnComp);
  });

  describe('Exceptions', function() {

    test('should throw an error if routerStore is not passed/injected into the component', () => {
      const renderComp = () => mount(
        <NodeComp/>
      );
      // It will be mobx-react to throw, not my comp
      expect(renderComp).toThrowError();
    });

    // NOTE: This will also invalidates propTypes
    test('should throw an error if routerStore is passed but empty/null', () => {
      const renderComp = () => mount(
        <NodeComp routerStore={null}/>
      );
      expect(renderComp).toThrowError('[react-mobx-router5][routeNode] missing routerStore');
    });

    test('should throw an error if router5-mobx plugin is not used', () => {
      router = createTestRouter();
      routerStore = new RouterStore();
      const renderComp = () => mount(
        <NodeComp routerStore={routerStore}/>
      );
      expect(renderComp).toThrowError('[react-mobx-router5][routeNode] missing mobx plugin');
    });
  });

  describe('Wrapper component (RouteNode)', function() {
    test('should receive the routerStore prop (and router instance)', () => {
      const output = mount(
        <NodeComp routerStore={routerStore}/>
      );
      expect(output.instance().wrappedInstance.props.routerStore.router).toBe(router);
    });
  });

  describe('Wrapped component (RouteComponent)', function() {

    test('should receive props: `routerStore`, `route`(observable) and `plainRoute` (non-observable) ', () => {
      const SegmentCompSpy = jest.fn(FnComp);
      NodeComp = routeNode('')(SegmentCompSpy);
      router.addNode('home', '/home');
      router.addNode('section', '/section');
      router.setOption('defaultRoute', 'home');
      router.start('home', function() {
        const previousRoute = router.getState();
        navigateToSection(previousRoute);
      });

      function navigateToSection(previousRoute) {
        router.navigate('section', {}, {}, function() {

          mount(
            <NodeComp routerStore={routerStore}/>
          );

          expect(SegmentCompSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              routerStore: routerStore,
              route: routerStore.route,
              plainRoute: router.getState()
            }),
            {}
          );

        });
      }

    });

  });

});
