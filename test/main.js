import React from 'react';
import {renderIntoDocument, findRenderedComponentWithType} from 'react-addons-test-utils';
import { Provider as MobXProvider, inject } from 'mobx-react';
import {RouterStore, mobxPlugin} from 'mobx-router5';
import chai, {expect} from 'chai';
import {spy} from 'sinon';
import {mount} from 'enzyme';
import {FnChild, Child, ChildWithInjectedStore, createTestRouter, renderWithRouterStore} from './test-utils';
import {BaseLink, Link, NavLink, routeNode, utils, withLink, withRoute} from '../src/index';

// Initialize should
chai.should();



describe('mobx-react Provider component', () => {
  let router;
  let routerStore;

  before(function () {
    router = createTestRouter();
    routerStore = new RouterStore();
  });

  it('should not add the routerStore to the child props', () => {
    const tree = renderWithRouterStore(routerStore)(Child);
    const child = findRenderedComponentWithType(tree, Child);
    expect(child.props.routerStore).to.be.undefined;
  });

  it('should inject the routerStore in the component props whom is decorated with @inject', () => {
    const tree = renderWithRouterStore(routerStore)(ChildWithInjectedStore);
    const child = findRenderedComponentWithType(tree, ChildWithInjectedStore);
    expect(child.wrappedInstance.props.routerStore).to.equal(routerStore);
  });

  it('should not add the router instance to the injected routerStore prop when mobXPlugin is not used', () => {
    const tree = renderWithRouterStore(routerStore)(ChildWithInjectedStore);
    const child = findRenderedComponentWithType(tree, ChildWithInjectedStore);
    expect(child.wrappedInstance.props.routerStore.router).to.be.null;
  });

  it('should add the router instance to the injected routerStore prop when mobxPlugin is used', () => {
    router.usePlugin(mobxPlugin(routerStore));
    const tree = renderWithRouterStore(routerStore)(ChildWithInjectedStore);
    const child = findRenderedComponentWithType(tree, ChildWithInjectedStore);
    expect(child.wrappedInstance.props.routerStore.router).to.equal(router);
  });

});


describe('withRoute hoc', () => {
  let router;
  let routerStore;
  const SimpleComp = () => <div />;

  const withRouteWrapperDefaultProps = {
    activeClassName: "active",
    activeStrict: false,
    routeOptions: {},
    routeParams: {},
  };

  beforeEach(() => {
    router = createTestRouter();
    routerStore = new RouterStore();
  });

  afterEach(() => {
    router = null;
    routerStore = null;
  });

  // it('should throw an error if mobx-router5/mobxPlugin is not used', () => {
  //   const CompWithRoute = withRoute(SimpleComp);
  //   const renderTree = () => renderWithRouterStore(routerStore)(CompWithRoute);
  //   expect(renderTree).to.throw(/^\[react-mobx-router5\]\[withRoute\] missing mobx plugin$/);
  // });
  //
  // it('should inject the routerStore in the ComponentWithRoute wrapper props', () => {
  //   router.usePlugin(mobxPlugin(routerStore));
  //   const CompWithRoute = withRoute(FnChild);
  //   const tree = renderWithRouterStore(routerStore)(CompWithRoute);
  //   const child = findRenderedComponentWithType(tree, CompWithRoute);
  //   expect(child.wrappedInstance.props.routerStore).to.equal(routerStore);
  // });
  //
  // it('should add the router instance to the injected routerStore prop in the ComponentWithRoute wrapper', () => {
  //   router.usePlugin(mobxPlugin(routerStore));
  //   const CompWithRoute = withRoute(FnChild);
  //   const tree = renderWithRouterStore(routerStore)(CompWithRoute);
  //   const child = findRenderedComponentWithType(tree, CompWithRoute);
  //   expect(child.wrappedInstance.props.routerStore.router).to.equal(router);
  // });
  //
  // it("should inject the routerStore + ComponentWithRoute's defaultPros into the wrapped component props", () => {
  //   // FnChild is actually the BaseComponent into the ComponentWithRoute render.
  //   // All props passed to it from there
  //   const ChildSpy = spy(FnChild);
  //   router.usePlugin(mobxPlugin(routerStore));
  //   const tree = renderWithRouterStore(routerStore)(withRoute(ChildSpy));
  //   expect(ChildSpy).to.have.been.calledWith({routerStore, ...withRouteWrapperDefaultProps, className: '', children: undefined});
  // });

  it("should add an `active` class to the wrapped component if associated route is active", () => {
    router.usePlugin(mobxPlugin(routerStore));
    const ChildWithRoute = withRoute(FnChild);

    router.addNode('home', '/home');
    router.setOption('defaultRoute', 'home');
    router.start();

    const output = mount(
      <MobXProvider routerStore={routerStore}>
        <ChildWithRoute routeName='home' />
      </MobXProvider>
    );

    expect(output.find('#fn-child')).to.have.className('active');
  });

  it("should not have an `active` class to the wrapped component if associated route is not active", () => {
    router.usePlugin(mobxPlugin(routerStore));
    const ChildWithRoute = withRoute(FnChild);

    router.addNode('home', '/home');
    router.addNode('section', '/section');
    router.setOption('defaultRoute', 'section');
    router.start();

    const output = mount(
      <MobXProvider routerStore={routerStore}>
        <ChildWithRoute routeName='home' />
      </MobXProvider>
    );

    expect(output.find('#fn-child')).to.not.have.className('active');
  });
});

//
// describe('routeNode hoc', () => {
//     let router;
//
//     before(() => {
//         router = createTestRouter();
//     });
//
//     it('should throw an error if router5-plugin-listeners plugin is not used', () => {
//         const renderTree = () => renderWithRouter(router)(routeNode('')(Child));
//         expect(renderTree).to.throw('[react-router5][routeNode] missing listeners plugin');
//     });
//
//     it('should inject the router in the wrapped component props', () => {
//         const ChildSpy = spy(FnChild);
//         router.usePlugin(listenersPlugin());
//         const tree = renderWithRouter(router)(withRoute(ChildSpy));
//         expect(ChildSpy).to.have.been.calledWith({ router, route: null, previousRoute: null });
//     });
// });
//
// describe('BaseLink component', () => {
//     let router;
//
//     before(() => {
//         router = createTestRouter();
//     });
//
//     it('should render an hyperlink element', () => {
//         router.addNode('home', '/home');
//         const output = mount(<RouterProvider router={ router }><BaseLink routeName={ 'home' } /></RouterProvider>);
//         expect(output.find('a')).to.have.attr('href', '/home')
//         expect(output.find('a')).not.to.have.className('active');
//     });
//
//     it('should have an active class if associated route is active', () => {
//         router.setOption('defaultRoute', 'home');
//         router.start();
//         const output = mount(<RouterProvider router={ router }><BaseLink routeName={ 'home' } /></RouterProvider>);
//         expect(output.find('a')).to.have.className('active');
//     });
// });
