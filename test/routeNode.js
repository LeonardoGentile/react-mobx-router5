import React from "react";
import {expect} from "chai";
import {spy} from "sinon";
import {mount} from "enzyme";
import {mobxPlugin, RouterStore} from "mobx-router5";
import {createTestRouter} from "./utils/test-utils";


//TODO:
describe('routeNode hoc', () => {
  let router;
  let routerStore;

  beforeEach(() => {
    routerStore = new RouterStore();
    router = createTestRouter();
    router.usePlugin(mobxPlugin(routerStore));
  });

  // context('BaseComponentWrapper', function () {

    it('should throw an error if router5-plugin-listeners plugin is not used', () => {
      const renderTree = () => renderWithRouter(router)(routeNode('')(Child));
      expect(renderTree).to.throw('[react-router5][routeNode] missing listeners plugin');
    });

    it('should inject the router in the wrapped component props', () => {
      const ChildSpy = spy(FnChild);
      router.usePlugin(listenersPlugin());
      const tree = renderWithRouter(router)(withRoute(ChildSpy));
      expect(ChildSpy).to.have.been.calledWith({router, route: null, previousRoute: null});
    });

  // });
});
