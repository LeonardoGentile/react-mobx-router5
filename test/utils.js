import {getComponent} from '../src/modules/utils';

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
      // I = {name: 'i'},
      L = {name: 'l'},
      M = {name: 'm'};

  beforeAll(function () {
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

  describe("Route: 'a' ", function() {

    test("should get the component for node: '' ", () => {
      const comp = getComponent('a', '', routes);
      expect(comp).toBe(A);
    });

    test("should throw for node: 'd' ", () => {
      const getComp = () => getComponent('a', 'd', routes);
      expect(getComp).toThrowError('could not find route or component');
    });

    test("should throw for node: 'd.h' ", () => {
      const getComp = () => getComponent('a', 'd.h', routes);
      expect(getComp).toThrowError('could not find route or component');
    });
  });

  describe("Route: 'd.f' ", function() {
    test("should get the component for node: '' ", () => {
      const comp = getComponent('d.f', '', routes);
      expect(comp).toBe(D);
    });

    test("should get the component for node: 'd' ", () => {
      const comp = getComponent('d.f', 'd', routes);
      expect(comp).toBe(F);
    });

    test("should get the component for node: 'd.h' ", () => {
      const getComp = () => getComponent('d.f', 'd.h', routes);
      expect(getComp).toThrowError('could not find route or component');
    });

  });

  describe("Route: 'd.h.m' ", function() {

    test("should get the component for node: '' ", () => {
      const comp = getComponent('d.h.m', '', routes);
      expect(comp).toBe(D);
    });

    test("should get the component for node: 'd' ", () => {
      const comp = getComponent('d.h.m', 'd', routes);
      expect(comp).toBe(H);
    });

    test("should get the component for node: 'd.h' ", () => {
      const comp = getComponent('d.h.m', 'd.h', routes);
      expect(comp).toBe(M);
    });

  });

  describe("Component undefined for route: 'd.h.i' ", function() {

    test("should get the component for node: '' ", () => {
      const comp = getComponent('d.h.i', '', routes);
      expect(comp).toBe(D);
    });

    test("should get the component for node: 'd' ", () => {
      const comp = getComponent('d.h.i', 'd', routes);
      expect(comp).toBe(H);
    });

    test("should throw for node: 'd.h' ", () => {
      const getComp = () => getComponent('d.h.i', 'd.h', routes);
      expect(getComp).toThrowError("Route segment 'i' does not have a component field");
    });
  });

});
