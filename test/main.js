import React from 'react';
import { renderIntoDocument, findRenderedComponentWithType } from 'react-addons-test-utils';
import listenersPlugin from 'router5/plugins/listeners';
import { expect } from 'chai';
import { spy } from 'sinon';
import { mount } from 'enzyme';
import { Child, createTestRouter, FnChild, renderWithRouter } from './test-utils';
import { BaseLink, Link, NavLink, routeNode, utils, withLink, withRoute } from '../src/index';



describe('RouterProvider component', () => {
    it('should add the store to the child props via context', () => {
        const router = createTestRouter();
        const tree = renderWithRouter(router)(Child);

        const child = findRenderedComponentWithType(tree, Child);
        console.log(JSON.stringify(child.wrappedInstance.props));
        expect(child.wrappedInstance.props.routerStore.router).to.equal(router);
    });
});

// describe('withRoute hoc', () => {
//     let router;
//
//     before(() => {
//         router = createTestRouter();
//     });
//
//     it('should throw an error if router5-plugin-listeners plugin is not used', () => {
//         const renderTree = () => renderWithRouter(router)(withRoute(() => <div />));
//         expect(renderTree).to.throw('[react-router5][withRoute] missing listeners plugin');
//     });
//
//     it('should inject the router in the wrapped component props', () => {
//         const ChildSpy = spy(FnChild);
//         router.usePlugin(listenersPlugin());
//
//         const tree = renderWithRouter(router)(withRoute(ChildSpy));
//         expect(ChildSpy).to.have.been.calledWith({ router, route: null, previousRoute: null });
//     });
// });
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
