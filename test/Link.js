import React from 'react';
import {mobxPlugin, RouterStore} from 'mobx-router5';
import {createTestRouter, renderWithProvider} from './utils/test-utils';
import {mount, shallow} from 'enzyme';
import Link from '../src/modules/Link';

describe('Link component', () => {
  let router;
  let routerStore;

  beforeEach(() => {
    routerStore = new RouterStore();
    router = createTestRouter();
    router.usePlugin(mobxPlugin(routerStore));
  });

  test('should inject the routerStore in the Link wrapper', () => {
    const wrapper = renderWithProvider(routerStore)(Link); //TOFIX, tree in undefined
    const child = wrapper.find(Link);
    expect(child.instance().wrappedInstance.props.routerStore).toBe(routerStore);
  });

  test('should throw an exception when routerStore is not injected', () => {
    const renderTreeFn = () => shallow(
      <Link />
    );
    expect(renderTreeFn).toThrowError();
  });

   test('should render an hyperlink element with href', () => {
    router.addNode('home', '/home');
    router.setOption('defaultRoute', 'home');
    router.start();
    const output = mount(
      <Link routerStore={routerStore} routeName={'home'}/>
    );
    chaiExpect(output.find('a')).to.have.attr('href', '/home');
  });

  test('should add an active className to the hyperlink', () => {
    router.addNode('home', '/home');
    router.addNode('section', '/section');
    router.setOption('defaultRoute', 'home');
    router.start('home');
    const output = mount(
      <Link routerStore={routerStore} routeName={'home'} className="just-a-class-name" />
    );
    chaiExpect(output.find('a')).to.have.attr('class', 'just-a-class-name active');
  });

  test('should not add an active className to the hyperlink', () => {
    router.setOption('defaultRoute', 'section');
    router.addNode('home', '/home');
    router.addNode('section', '/section');
    router.start('section');
    const output = mount(
      <Link routerStore={routerStore} routeName={'home'} className="just-a-class-name" />
    );
    chaiExpect(output.find('a')).to.have.className('just-a-class-name');
  });

  test('should call the onClick cb when the hyperlink is clicked', () => {
    router.start();
    const onClickSpy = jest.fn();
    const output = mount(
      <Link routerStore={routerStore} onClick={onClickSpy} />
    );
    output.find('a').simulate('click');
    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });

  test('should call the onClick cb instead of navigation when routeName is also passed', () => {
    router.addNode('home', '/home');
    router.start();
    const onClickSpy = jest.fn();
    const navigateSpy = jest.fn(router, 'navigate');
    const output = mount(
      <Link routerStore={routerStore} onClick={onClickSpy} routeName={'home'}/>
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
      <Link routerStore={routerStore} routeName={'section'}/>
    );
    output.find('a').simulate('click', {button:0});
    expect(onClickSpy).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith('section', {}, {});
  });

});
