import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {mobxPlugin, RouterStore} from 'mobx-router5';
import {createTestRouter} from './utils/test-utils';

import Route from "../src/modules/Route";


describe('routeNode hoc', () => {
  let router;
  let routerStore;
  let routes;

  const DComp = (props) => <div id="d-comp"/>;
  DComp.displayName = 'CComp';

  const HComp = (props) => <div id="h-comp"/>;
  HComp.displayName = 'GComp';

  const MComp = (props) => <div id="m-comp"/>;
  MComp.displayName = 'MComp';

  before(function () {
    routes = [
      {name: 'a', path: '/a'},
      {name: 'b', path: '/b'},
      {name: 'c', path: '/c'},
      {
        name: 'd', path: '/d', component: DComp, children: [
        {name: 'e', path: '/e'},
        {name: 'f', path: '/f'},
        {name: 'g', path: '/g'},
        {
          name: 'h', path: '/h', component: HComp, children: [
          {name: 'i', path: '/i'},
          {name: 'l', path: '/l'},
          {name: 'm', path: '/m', component: MComp}
        ]
        }
      ]
      }
    ];
  });


  beforeEach(() => {
    router = createTestRouter();
    routerStore = new RouterStore();
    router.usePlugin(mobxPlugin(routerStore));

  });

  context('Exceptions', function () {

    it('should throw when route or routerStore props not passed', () => {
      const RouteComp = (props) => (
        <Route routes={routes}/>
      );

      const renderComp = () => mount(
        <RouteComp />
      );
      expect(renderComp).to.throw();
    });
  });

  context('Render the Component', function () {

    it('Find and Render the Component associated with the route d.h.m ', () => {

      const renderedD = mount(
        <Route routes={routes} route='d.h.m' routeNodeName=""/>
      );
      expect(renderedD.find('div')).to.have.attr('id', 'd-comp');

      const renderedH = mount(
        <Route routes={routes} route='d.h.m' routeNodeName="d"/>
      );
      expect(renderedH.find('div')).to.have.attr('id', 'h-comp');

      const renderedM = mount(
        <Route routes={routes} route='d.h.m' routeNodeName="d.h"/>
      );
      expect(renderedM.find('div')).to.have.attr('id', 'm-comp');

    });

  });

});
