import React from "react";
import {findRenderedComponentWithType, renderIntoDocument} from "react-addons-test-utils";
import {expect} from "chai";
import {spy} from "sinon";
import {Provider as MobXProvider} from "mobx-react";
import {mobxPlugin, RouterStore} from "mobx-router5";
import {Child, createTestRouter, FnChild, renderWithRouterStore} from "./utils/test-utils";
import {withRoute} from "../src/index";
import {mount} from "enzyme";

// TOFIX: type-detect bug
// I've manually modified type-detect: https://github.com/chaijs/type-detect/pull/91/files

describe('withRoute HOC', () => {
  let router;
  let routerStore;

  const withRouteWrapperDefaultProps = {
    activeClassName: "active",
    activeStrict: false,
    routeOptions: {},
    routeParams: {},
  };

  beforeEach(() => {
    routerStore = new RouterStore();
    router = createTestRouter();
    router.usePlugin(mobxPlugin(routerStore));
  });

  // afterEach(() => {
  //   router = null;
  //   routerStore = null;
  // });

  context('without mobxPlugin', function() {
    it('should throw an error if mobx-router5/mobxPlugin is not used', () => {
      routerStore = new RouterStore();
      const CompWithRoute = withRoute(FnChild);
      const renderTree = () => renderWithRouterStore(routerStore)(CompWithRoute);
      expect(renderTree).to.throw(/^\[react-mobx-router5\]\[withRoute\] missing mobx plugin$/);
    });
  });

  context('with mobxPlugin', function() {
    it('should inject the routerStore in the ComponentWithRoute wrapper props', () => {
      const CompWithRoute = withRoute(FnChild);
      const tree = renderWithRouterStore(routerStore)(CompWithRoute);
      const child = findRenderedComponentWithType(tree, CompWithRoute);
      expect(child.wrappedInstance.props.routerStore).to.equal(routerStore);
    });


    it('should add the router instance into the injected routerStore prop in the ComponentWithRoute Wrapper', () => {
      const CompWithRoute = withRoute(FnChild);
      const tree = renderWithRouterStore(routerStore)(CompWithRoute);
      const child = findRenderedComponentWithType(tree, CompWithRoute);
      expect(child.wrappedInstance.props.routerStore.router).to.equal(router);
    });


    it("should throw an error if a prop `activeRoute` is passed to the wrapped component", () => {
      const ChildWithRoute = withRoute(FnChild);
      const renderTree = () => renderIntoDocument(
        <MobXProvider routerStore={routerStore}>
          <ChildWithRoute activeRoute="home" />
        </MobXProvider>
      );
      expect(renderTree).to.throw(/^\[react-mobx-router5\]\[withRoute\] prop names `activeRoute` is reserved\.$/);
    });


    // FnChild is actually the BaseComponent into the ComponentWithRoute render.
    // All props passed to it from there
    it("should pass the routerStore + defaultProps into the wrapped component props", () => {
      const ChildSpy = spy(FnChild);
      const ChildSpyWithRoute = withRoute(ChildSpy);
      const tree = renderWithRouterStore(routerStore)(ChildSpyWithRoute);
      expect(ChildSpy).to.have.been.calledWithMatch({routerStore: routerStore, ...withRouteWrapperDefaultProps });
    });


    it("should add pass an `activeRoute` prop to the wrapped component to force re-rendering on route change", () => {
      const ChildSpy = spy(FnChild);
      const ChildWithRoute = withRoute(ChildSpy);

      router.addNode('home', '/home');
      router.setOption('defaultRoute', 'home');
      router.start('home', (err, state) => {
        const tree = renderWithRouterStore(routerStore)(ChildWithRoute);
        expect(ChildSpy).to.have.been.calledWithMatch({activeRoute: router.getState()});
      });
    });


    it("should pass an `active` className prop to the wrapped component if associated route is active", () => {
      const ChildSpy = spy(FnChild);
      const ChildWithRoute = withRoute(ChildSpy);

      router.addNode('home', '/home');
      router.setOption('defaultRoute', 'home');
      router.start((err, state) => {
        const tree = renderIntoDocument(
          <MobXProvider routerStore={routerStore}>
            <ChildWithRoute routeName='home'/>
          </MobXProvider>
        );
        expect(ChildSpy).to.have.been.calledWithMatch({className: 'active'});
      });
    });


    it("should not pass an `active` className prop to the wrapped component if associated route is not active", () => {
      const ChildSpy = spy(FnChild);
      const ChildWithRoute = withRoute(ChildSpy);

      router.addNode('home', '/home');
      router.addNode('section', '/section');
      router.setOption('defaultRoute', 'home');
      router.start((err, state) => {
        const tree = renderIntoDocument(
          <MobXProvider routerStore={routerStore}>
            <ChildWithRoute routeName='section'/>
          </MobXProvider>
        );
        expect(ChildSpy).to.have.been.calledWithMatch({className: ''});
      });
    });


    it("should add the LinkComponent as child of BaseComponent", () => {
      const ChildWithRoute = withRoute(Child, 'routerStore', FnChild);
      const output = mount(
        <MobXProvider routerStore={routerStore}>
          <ChildWithRoute />
        </MobXProvider>
      );
      expect(output.find('Child').children('FnChild')).to.have.length(1);
    });

  });

});
