import React from "react";
import {findRenderedComponentWithType, renderIntoDocument} from "react-addons-test-utils";
import {expect} from "chai";
import {spy, stub} from "sinon";
import {Provider as MobXProvider} from "mobx-react";
import {mobxPlugin, RouterStore} from "mobx-router5";
import {createTestRouter, FnChild, renderWithProvider, renderWithRouterStore} from "./utils/test-utils";
import {withRoute} from "../src/index";
import {mount, shallow} from "enzyme";

// TOFIX: type-detect bug
// I've manually modified type-detect: https://github.com/chaijs/type-detect/pull/91/files

describe('withRoute HOC', () => {
  let router;
  let routerStore;
  let CompWithRoute;

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
    CompWithRoute = withRoute(FnChild);
  });


  // context('without mobxPlugin', function() {
  //   it('should throw an error if mobx-router5/mobxPlugin is not used', () => {
  //     routerStore = new RouterStore();
  //     const renderTreeFn = () => renderWithProvider(routerStore)(CompWithRoute);
  //     expect(renderTreeFn).to.throw(/^\[react-mobx-router5\]\[withRoute\] missing mobx plugin$/);
  //   });
  // });

  context('Mobx Provider', function() {
    it('should inject the routerStore in the ComponentWithRoute wrapper props', () => {
      const tree = renderWithProvider(routerStore)(CompWithRoute);
      const child = findRenderedComponentWithType(tree, CompWithRoute);
      expect(child.wrappedInstance.props.routerStore).to.equal(routerStore);
    });

    it('should add the router instance into the injected routerStore prop in the ComponentWithRoute Wrapper', () => {
      const tree = renderWithProvider(routerStore)(CompWithRoute);
      const child = findRenderedComponentWithType(tree, CompWithRoute);
      expect(child.wrappedInstance.props.routerStore.router).to.equal(router);
    });

  });

  context('ComponentWithRoute wrapper component', function() {

    it('should throw an error if mobx-router5/mobxPlugin is not used', () => {
      routerStore = new RouterStore();
      const renderTreeFn = () => renderWithRouterStore(routerStore)(CompWithRoute);
      expect(renderTreeFn).to.throw(/^\[react-mobx-router5\]\[withRoute\] missing mobx plugin$/);
    });

    it("should throw an error if a prop `activeRoute` is passed to the wrapped component", () => {
      const renderTreeFn = () =>  mount(
        <CompWithRoute routerStore={routerStore} activeRoute="home" />
      );
      expect(renderTreeFn).to.throw(/^\[react-mobx-router5\]\[withRoute\] prop names `activeRoute` is reserved\.$/);
    });

    it("should pass the routerStore + defaultProps to the wrapped component props", () => {
      const ChildSpy = spy(FnChild);
      const ChildSpyWithRoute = withRoute(ChildSpy);
      const tree = renderWithRouterStore(routerStore)(ChildSpyWithRoute);
      expect(ChildSpy).to.have.been.calledWithMatch({routerStore: routerStore, ...withRouteWrapperDefaultProps });
    });
  //
  //   // Using wrappedComponent because of the @inject: https://github.com/mobxjs/mobx-react#testing-store-injection
  //   // Otherwise use mount()
  //   it('should return true when routeName prop is the current active Route', function() {
  //     const ChildWithRoute = withRoute(FnChild);
  //     router.addNode('home', '/home');
  //     router.setOption('defaultRoute', 'home');
  //     router.start((err, state) => {
  //       const output = shallow(
  //         <ChildWithRoute.wrappedComponent routeName='home' routerStore={routerStore} />
  //       );
  //       const {routeName, routeParams, activeStrict} = output.instance().props;
  //       expect(output.instance().isActive(routeName, routeParams, activeStrict)).to.be.true;
  //     });
  //   });
  //
  //   it("should pass an extra `activeRoute` prop to the wrapped component to force re-rendering on route change", () => {
  //     const ChildSpy = spy(FnChild);
  //     const ChildWithRoute = withRoute(ChildSpy);
  //
  //     router.addNode('home', '/home');
  //     router.setOption('defaultRoute', 'home');
  //     router.start('home', (err, state) => {
  //       const tree = renderWithRouterStore(routerStore)(ChildWithRoute);
  //       expect(ChildSpy).to.have.been.calledWithMatch({activeRoute: router.getState()});
  //     });
  //   });
  //
  //
  //   it('should return an `active` class name when routeName prop is the current active Route', function() {
  //     const ChildWithRoute = withRoute(FnChild);
  //     router.addNode('home', '/home');
  //     router.setOption('defaultRoute', 'home');
  //     router.start((err, state) => {
  //       // Using wrappedComponent because of the @inject: https://github.com/mobxjs/mobx-react#testing-store-injection
  //       const output = shallow(
  //         <ChildWithRoute.wrappedComponent routeName='home' routerStore={routerStore} />
  //       );
  //
  //       const {routeName, routeParams, activeStrict, className, activeClassName} = output.instance().props;
  //       let isActive = output.instance().isActive(routeName, routeParams, activeStrict)
  //       let currentClassName = ChildWithRoute.computeClassName(className, activeClassName, isActive);
  //
  //       expect(currentClassName).to.equal('active');
  //     });
  //   });
  //
  //   it("should add an `active` className to props passed to the wrapped component when the associated route is active", () => {
  //     const ChildSpy = spy(FnChild);
  //     const ChildWithRoute = withRoute(ChildSpy);
  //
  //     router.addNode('home', '/home');
  //     router.setOption('defaultRoute', 'home');
  //     router.start((err, state) => {
  //       const tree = renderIntoDocument(
  //         <MobXProvider routerStore={routerStore}>
  //           <ChildWithRoute routeName='home'/>
  //         </MobXProvider>
  //       );
  //       expect(ChildSpy).to.have.been.calledWithMatch({className: 'active'});
  //     });
  //   });
  //
  //
  //   it("should not add an `active` className to props passed to the wrapped component if associated route is not active", () => {
  //     const ChildSpy = spy(FnChild);
  //     const ChildWithRoute = withRoute(ChildSpy);
  //
  //     router.addNode('home', '/home');
  //     router.addNode('section', '/section');
  //     router.setOption('defaultRoute', 'home');
  //     router.start((err, state) => {
  //       const tree = renderIntoDocument(
  //         <MobXProvider routerStore={routerStore}>
  //           <ChildWithRoute routeName='section'/>
  //         </MobXProvider>
  //       );
  //       expect(ChildSpy).to.have.been.calledWithMatch({className: ''});
  //     });
  //   });
  //
  //
  });

});
