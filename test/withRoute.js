import React from "react";
import {findRenderedComponentWithType} from "react-addons-test-utils";
import {expect} from "chai";
import {spy} from "sinon";
import {mount} from "enzyme";
import {mobxPlugin, RouterStore} from "mobx-router5";
import {createTestRouter, FnComp, renderWithProvider, renderWithStore} from "./utils/test-utils";
import {withRoute} from "../src/index";

describe('withRoute HOC', () => {
  let router;
  let routerStore;
  let CompWithRoute;

  const ComponentWithRouteDefaultProps = {
    activeClassName: "active",
    activeStrict: false,
    routeOptions: {},
    routeParams: {},
  };

  beforeEach(() => {
    routerStore = new RouterStore();
    router = createTestRouter();
    router.usePlugin(mobxPlugin(routerStore));
    CompWithRoute = withRoute(FnComp);
  });

  context('Mobx Provider/Inject', function() {
    it('should inject the routerStore in the ComponentWithRoute wrapper props', () => {
      const tree = renderWithProvider(routerStore)(CompWithRoute);
      const child = findRenderedComponentWithType(tree, CompWithRoute);
      expect(child.wrappedInstance.props.routerStore).to.equal(routerStore);
    });

    it('should add the router instance into the injected routerStore', () => {
      const tree = renderWithProvider(routerStore)(CompWithRoute);
      const child = findRenderedComponentWithType(tree, CompWithRoute);
      expect(child.wrappedInstance.props.routerStore.router).to.equal(router);
    });
  });

  context('Wrapper component (ComponentWithRoute) ', function() {

    context('Exceptions', function() {
      it('should throw an error if routerStore is not passed', () => {
        const renderTreeFn = () => renderWithStore()(CompWithRoute);
        expect(renderTreeFn).to.throw('[react-mobx-router5][withRoute] missing routerStore');
      });

      it('should throw an error if mobx-router5/mobxPlugin is not used', () => {
        routerStore = new RouterStore();
        const renderTreeFn = () => renderWithStore(routerStore)(CompWithRoute);
        expect(renderTreeFn).to.throw('[react-mobx-router5][withRoute] missing mobx plugin');
      });

      it("should throw an error if it receives `route` prop ", () => {
        const renderCompFn = () =>  mount(
          <CompWithRoute routerStore={routerStore} route="home" />
        );
        expect(renderCompFn).to.throw('[react-mobx-router5][withRoute] prop names `route` and `previousRoute` are reserved.');
      });

      it("should throw an error if it receives `previousRoute` prop", () => {
        const renderCompFn = () =>  mount(
          <CompWithRoute routerStore={routerStore} previousRoute="home" />
        );
        expect(renderCompFn).to.throw('[react-mobx-router5][withRoute] prop names `route` and `previousRoute` are reserved.');
      });
    });

    context('Methods', function() {
      // ALTERNATIVE to next test: using SHALLOW rendering
      // Note: using CompWithRoute.wrappedComponent because of the @inject: https://github.com/mobxjs/mobx-react#testing-store-injection
      //
      // const output = shallow(
      //   <CompWithRoute.wrappedComponent routerStore={routerStore} routeName='home' />
      // );
      // const {routeName, routeParams, activeStrict} = output.instance().props;
      // expect(output.instance().isActive(routeName, routeParams, activeStrict)).to.be.true;

      it('should return true when routeName prop is the current active Route', function() {
        router.addNode('home', '/home');
        router.setOption('defaultRoute', 'home');
        router.start();
        const output = mount(
          <CompWithRoute routerStore={routerStore} routeName='home' />
        );
        const {routeName, routeParams, activeStrict} = output.instance().props;
        expect(output.instance().wrappedInstance.isActive(routeName, routeParams, activeStrict)).to.be.true;
      });

      it('should returns an `active` class name when routeName prop is the current active Route', function() {
        router.addNode('home', '/home');
        router.setOption('defaultRoute', 'home');
        router.start();
        const output = mount(
          <CompWithRoute routerStore={routerStore} routeName='home' />
        );
        const {routeName, routeParams, activeStrict, className, activeClassName} = output.instance().props;
        let isActive = output.instance().wrappedInstance.isActive(routeName, routeParams, activeStrict);
        let currentClassName = CompWithRoute.computeClassName(className, activeClassName, isActive);
        expect(currentClassName).to.equal('active');
      });
    });

  });

  context('Wrapped component (BaseComponent)', function() {

    it("should receive the routerStore + default routing props", () => {
      const WrappedCompSpy = spy(FnComp);
      const CompWithRoute = withRoute(WrappedCompSpy);
      const output = renderWithStore(routerStore)(CompWithRoute);
      expect(WrappedCompSpy).to.have.been.calledWithMatch({routerStore: routerStore, ...ComponentWithRouteDefaultProps});
    });

    it("should receive props `routerStore` and  also `route` and `previousRoute` on any route change (to force re-rendering)", () => {
      const WrappedCompSpy = spy(FnComp);
      const CompWithRoute = withRoute(WrappedCompSpy);

      router.addNode('home', '/home');
      router.setOption('defaultRoute', 'home');
      router.start();
      const output = renderWithStore(routerStore)(CompWithRoute);
      expect(WrappedCompSpy).to.have.been.calledWithMatch({route: router.getState(), previousRoute: null, routerStore: routerStore});
    });

    it("should receive an extra className value `active` prop when the associated route is active", () => {
      const WrappedCompSpy = spy(FnComp);
      const CompWithRoute = withRoute(WrappedCompSpy);

      router.addNode('home', '/home');
      router.setOption('defaultRoute', 'home');
      router.start();
      const output = mount(
        <CompWithRoute routerStore={routerStore} routeName='home' className="just-a-class-name"/>
      );
      expect(WrappedCompSpy).to.have.been.calledWithMatch({className: 'just-a-class-name active'});
    });

    it("should not receive an extra className value prop when the associated route is not active", () => {
      const WrappedCompSpy = spy(FnComp);
      const CompWithRoute = withRoute(WrappedCompSpy);

      router.addNode('home', '/home');
      router.addNode('section', '/section');
      router.setOption('defaultRoute', 'home');
      router.start();
      const output = mount(
        <CompWithRoute routerStore={routerStore} routeName='section' className="just-a-class-name"/>
      );
      expect(WrappedCompSpy).to.have.been.calledWithMatch({className: 'just-a-class-name'});
    });

  });

});
