import React from 'react';
import {renderIntoDocument, findRenderedComponentWithType} from 'react-addons-test-utils';
import listenersPlugin from 'router5/plugins/listeners';
import chai, {expect} from 'chai';
import {spy} from 'sinon';
import {mount} from 'enzyme';
import {Child, createTestRouter, FnChild, renderWithRouterStore, routerStore} from './test-utils';
import {BaseLink, Link, NavLink, routeNode, utils, withLink, withRoute} from '../src/index';

// Initialize should
chai.should();

// Probably should go to mobx-router5
describe('MobX Provider component', () => {
  let router;
  let tree;
  let child;

  before(function () {
    router = createTestRouter();
    tree = renderWithRouterStore(routerStore)(Child);
    child = findRenderedComponentWithType(tree, Child);
  });

  it('should add the routerStore to the child props via context', () => {
    expect(child.wrappedInstance.props.routerStore).to.equal(routerStore);
  });

  it('should not add the router instance to the child props routerStore', () => {
    expect(child.wrappedInstance.props.routerStore.router).to.be.null;
  });
});


describe('withRoute hoc', () => {
  let router;

  before(() => {
    router = createTestRouter();
  });

  it('should throw an error if mobx-router5/mobxPlugin is not used', () => {
    const BaseComp = () => <div />;
    const BaseCompWithRoute = withRoute(BaseComp);
    const renderTree = () => renderWithRouterStore(routerStore)(BaseCompWithRoute);
    expect(renderTree).to.throw(/^\[react-mobx-router5\]\[withRoute\] missing mobx plugin$/);
  });

  // it('should inject the router in the wrapped component props', () => {
  //   const ChildSpy = spy(FnChild);
  //   router.usePlugin(listenersPlugin());
  //
  //   const tree = renderWithRouter(router)(withRoute(ChildSpy));
  //   expect(ChildSpy).to.have.been.calledWith({router, route: null, previousRoute: null});
  // });
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
