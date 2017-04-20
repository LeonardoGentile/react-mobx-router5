import {getComponent} from '../src/modules/utils'
import {expect} from "chai";

describe('getComponent for current route and node', () => {
  let routes;
  const
      A = {name: 'a'},
      B = {name: 'b'},
      C = {name: 'c'},
      D = {name: 'd'},
      E = {name: 'e'},
      F = {name: 'f'},
      G = {name: 'g'},
      H = {name: 'h'},
      I = {name: 'i'},
      L = {name: 'l'},
      M = {name: 'm'};

  before(function () {
    routes = [
      { name: 'a', path: '/a', component: A },
      { name: 'b', path: '/b', component: B },
      { name: 'c', path: '/c', component: C },
      { name: 'd', path: '/d', component: D, children: [
        { name: 'e', path: '/e', component: E },
        { name: 'f', path: '/f', component:  F },
        { name: 'g', path: '/g', component:  G },
        { name: 'h', path: '/h', component: H, children: [
          { name: 'i', path: '/i' },
          { name: 'l', path: '/l', component: L },
          { name: 'm', path: '/m', component: M}
        ]}
      ]}
    ];
  });


  // Nodes are: '', 'd', 'd.h'

  context("Route: 'a' ", function() {

    it("should get the component for node: '' ", () => {
      const comp = getComponent('a', '', routes);
      expect(comp).to.equal(A);
    });

    it("should throw for node: 'd' ", () => {
      const getComp = () => getComponent('a', 'd', routes);
      expect(getComp).to.throw('could not find route or component')
    });

    it("should throw for node: 'd.h' ", () => {
      const getComp = () => getComponent('b', 'd.h', routes);
      expect(getComp).to.throw('could not find route or component')
    });
  });

  context("Route: 'd.f' ", function() {
    it("should get the component for node: '' ", () => {
      const comp = getComponent('d.f', '', routes);
      expect(comp).to.equal(D);
    });

    it("should get the component for node: 'd' ", () => {
      const comp = getComponent('d.f', 'd', routes);
      expect(comp).to.equal(F);
    });

    it("should get the component for node: 'd.h' ", () => {
      const getComp = () => getComponent('d.f', 'd.h', routes);
      expect(getComp).to.throw('could not find route or component')
    });

  });

  context("Route: 'd.h.m' ", function() {

    it("should get the component for node: '' ", () => {
      const comp = getComponent('d.h.m', '', routes);
      expect(comp).to.equal(D);
    });

    it("should get the component for node: 'd' ", () => {
      const comp = getComponent('d.h.m', 'd', routes);
      expect(comp).to.equal(H);
    });

    it("should get the component for node: 'd.h' ", () => {
      const comp = getComponent('d.h.m', 'd.h', routes);
      expect(comp).to.equal(M);
    });

  });

  context("Component undefined for route: 'd.h.i' ", function() {
    it("should get the component for node: '' ", () => {
      const comp = getComponent('d.h.i', '', routes);
      expect(comp).to.equal(D);
    });

    it("should get the component for node: 'd' ", () => {
      const comp = getComponent('d.h.i', 'd', routes);
      expect(comp).to.equal(H);
    });

    it("should get the component for node: 'd.h' ", () => {
      const getComp = () => getComponent('d.h.i', 'd.h', routes);
      expect(getComp).to.throw('route segment does not have a component field')
    });
  });

});
