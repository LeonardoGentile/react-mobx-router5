import React from 'react';
import {mount} from 'enzyme';
import {mobxPlugin, RouterStore} from 'mobx-router5';
import {createTestRouter} from './utils/test-utils';
import RouteView from '../src/modules/RouteView';
import PropTypes from 'prop-types';

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

  beforeAll(function () {
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
        ]}
      ]}
    ];

    router = createTestRouter();
    routerStore = new RouterStore();
    router.usePlugin(mobxPlugin(routerStore));

  });

  describe('Exceptions', function () {

    test('should throw when route prop is not passed', () => {
      const RouteComp = (props) => (
        <RouteView routes={routes}/>
      );

      const renderComp = () => mount(
        <RouteComp />
      );
      expect(renderComp).toThrowError();
    });

    test('should render the default error message with default color when an exception occurs', () => {
      const route = { name: 'd.h.l' }; // A route without component

      const RouteComp = (props) => (
        <RouteView routes={routes} route={route} routeNodeName="d.h"/>
      );

      const renderedL = mount(
        <RouteComp />
      );

      chaiExpect(renderedL.find('h1')).to.have.text('Something went wrong.');
      chaiExpect(renderedL.find('h1')).to.have.style('color', 'rgb(217, 83, 79)');

    });

    test('should render a custom error message with a custom style when an exception occurs', () => {
      const route = { name: 'd.h.l' }; // A route without component

      const RouteComp = (props) => (
        <RouteView routes={routes} route={route} routeNodeName="d.h" errorMessage={'Ay, caramba!'} errorStyle={{color: 'rgb(200, 90, 34)', 'fontWeight': 'bold' }}/>
      );

      const renderedL = mount(
        <RouteComp />
      );

      chaiExpect(renderedL.find('h1')).to.have.text('Ay, caramba!');
      chaiExpect(renderedL.find('h1')).to.have.style('color', 'rgb(200, 90, 34)');
      chaiExpect(renderedL.find('h1')).to.have.style('font-weight', 'bold');

    });

    test('should render a custom component when an exception occurs', () => {
      const route = { name: 'd.h.l' }; // A route without component
      const errorViewComponent = (props) => <div style={{color: 'rgb(0, 0, 0)'}}>{props.message}</div>;
      errorViewComponent.propTypes = {
        message: PropTypes.string
      };

      const RouteComp = (props) => (
        <RouteView routes={routes} route={route} routeNodeName="d.h" errorMessage={''}  errorViewComponent={errorViewComponent} errorViewComponentProps={{message : 'My custom component'}} />
      );

      const renderedL = mount(
        <RouteComp />
      );

      chaiExpect(renderedL.find('div')).to.have.text('My custom component');
      chaiExpect(renderedL.find('div')).to.have.style('color', 'rgb(0, 0, 0)');
    });

  });

  describe('Render the Component', function () {

    test('Find and Render the Component associated with the route d.h.m ', () => {

      const route = {
        name: 'd.h.m'
      };

      const renderedD = mount(
        <RouteView routes={routes} route={route} routeNodeName=""/>
      );
      chaiExpect(renderedD.find('div')).to.have.attr('id', 'd-comp');

      const renderedH = mount(
        <RouteView routes={routes} route={route} routeNodeName="d"/>
      );
      chaiExpect(renderedH.find('div')).to.have.attr('id', 'h-comp');

      const renderedM = mount(
        <RouteView routes={routes} route={route} routeNodeName="d.h"/>
      );
      chaiExpect(renderedM.find('div')).to.have.attr('id', 'm-comp');

    });

  });

});
