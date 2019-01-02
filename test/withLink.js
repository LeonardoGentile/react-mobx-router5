import React from 'react';
import {mount} from 'enzyme';
import {mobxPlugin, RouterStore} from 'mobx-router5';
import {createTestRouter} from './utils/test-utils';
import withLink from '../src/modules/withLink';
import NavLink from '../src/modules/NavLink';


describe('withLink', () => {
  let router;
  let routerStore;

  beforeEach(() => {
    routerStore = new RouterStore();
    router = createTestRouter();
    router.usePlugin(mobxPlugin(routerStore));
  });

  describe('BaseComponentWrapper', function() {

    test('should creates a `li` element around the the BaseLink', () => {
      const MyNavLink = withLink('li');
      router.addNode('home', '/home');
      router.setOption('defaultRoute', 'home');
      router.start();
      const output = mount(
        <MyNavLink
          routerStore={routerStore}
          routeName='home'
          className="the-li-class-name"
          linkClassName="the-link-class-name"/>
      );
      chaiExpect(output.find('li')).to.have.attr('class', 'the-li-class-name active');
      chaiExpect(output.find('a')).to.have.attr('class', 'the-link-class-name');
    });

  });

  describe('Link functionality', function() {
    test('should call the onClick cb instead of navigation when routeName is also passed', () => {

      router.addNode('home', '/home');
      router.start();
      const onClickSpy = jest.fn();
      const navigateSpy = jest.spyOn(router, 'navigate');
      const output = mount(
        <NavLink routerStore={routerStore} onClick={onClickSpy} routeName={'home'}/>
      );
      output.find('a').simulate('click');
      expect(onClickSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    test('should call router `navigate` when routeName is also passed and hyperlink clicked', () => {
      router.addNode('home', '/home');
      router.addNode('section', '/section');
      router.start();
      const onClickSpy = jest.fn();
      const navigateSpy = jest.spyOn(router, 'navigate');
      const output = mount(
        <NavLink routerStore={routerStore} routeName={'section'}/>
      );
      output.find('a').simulate('click', {button:0});
      expect(onClickSpy).not.toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith('section', {}, {});
    });

  });

});
