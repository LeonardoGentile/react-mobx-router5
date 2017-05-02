import React from 'react';
import {expect} from 'chai';
import {spy} from 'sinon';
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

  context('BaseComponentWrapper', function() {

    it('should creates a `li` element around the the BaseLink', () => {
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
      expect(output.find('li')).to.have.attr('class', 'the-li-class-name active');
      expect(output.find('a')).to.have.attr('class', 'the-link-class-name');
    });

  });

  context('Link functionality', function() {
    it('should call the onClick cb instead of navigation when routeName is also passed', () => {

      router.addNode('home', '/home');
      router.start();
      const onClickSpy = spy();
      const navigateSpy = spy(router, 'navigate');
      const output = mount(
        <NavLink routerStore={routerStore} onClick={onClickSpy} routeName={'home'}/>
      );
      output.find('a').simulate('click');
      expect(onClickSpy).to.have.been.calledOnce;
      expect(navigateSpy).to.have.not.been.called;
    });

    it('should call router `navigate` when routeName is also passed and hyperlink clicked', () => {
      router.addNode('home', '/home');
      router.addNode('section', '/section');
      router.start();
      const onClickSpy = spy();
      const navigateSpy = spy(router, 'navigate');
      const output = mount(
        <NavLink routerStore={routerStore} routeName={'section'}/>
      );
      output.find('a').simulate('click', {button:0});
      expect(onClickSpy).to.have.not.been.called;
      expect(navigateSpy).to.have.been.calledOnce;
      expect(navigateSpy).to.have.been.calledWith('section', {}, {});
    });

  });

});
