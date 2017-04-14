import React from "react";
import {findRenderedComponentWithType} from "react-addons-test-utils";
import {expect} from "chai";
import {spy} from "sinon";
import {mobxPlugin, RouterStore} from "mobx-router5";
import {createTestRouter, renderWithProvider} from "./utils/test-utils";
import {mount, shallow} from "enzyme";
import Link from "../src/modules/Link";

describe('BaseLink component', () => {
  let router;
  let routerStore;

  beforeEach(() => {
    routerStore = new RouterStore();
    router = createTestRouter();
    router.usePlugin(mobxPlugin(routerStore));
  });

  it('should inject the routerStore in the Link wrapper', () => {
    const tree = renderWithProvider(routerStore)(Link);
    const child = findRenderedComponentWithType(tree, Link);
    expect(child.wrappedInstance.props.routerStore).to.equal(routerStore);
  });

  it('should throw an exception when routerStore is not injected', () => {
    const renderTreeFn = () => shallow(
      <Link />
    );
    expect(renderTreeFn).to.throw();
  });

  it('should render an hyperlink element with href', () => {
    router.addNode('home', '/home');
    router.setOption('defaultRoute', 'home');
    router.start();
    const output = mount(
      <Link routerStore={routerStore} routeName={'home'}/>
    );
    expect(output.find('a')).to.have.attr('href', '/home');
  });

  it('should add an active className to the hyperlink', () => {
    router.addNode('home', '/home');
    router.addNode('section', '/section');
    router.setOption('defaultRoute', 'home');
    router.start('home');
    const output = mount(
      <Link routerStore={routerStore} routeName={'home'} className="just-a-class-name" />
    );
    expect(output.find('a')).to.have.attr('class', 'just-a-class-name active');
  });

  it('should not add an active className to the hyperlink', () => {
    router.setOption('defaultRoute', 'section');
    router.addNode('home', '/home');
    router.addNode('section', '/section');
    router.start('section');
    const output = mount(
      <Link routerStore={routerStore} routeName={'home'} className="just-a-class-name" />
    );
    expect(output.find('a')).to.have.className('just-a-class-name');
  });

  it('should call the onClick cb when the hyperlink is clicked', () => {
    router.start();
    const onClickSpy = spy();
    const output = mount(
      <Link routerStore={routerStore} onClick={onClickSpy} />
    );
    output.find('a').simulate('click');
    expect(onClickSpy).to.have.been.calledOnce;
  });

  it('should call the onClick cb instead of navigation when routeName is also passed', () => {
    router.addNode('home', '/home');
    router.start();
    const onClickSpy = spy();
    const navigateSpy = spy(router, 'navigate');
    const output = mount(
      <Link routerStore={routerStore} onClick={onClickSpy} routeName={'home'}/>
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
      <Link routerStore={routerStore} routeName={'section'}/>
    );
    output.find('a').simulate('click', {button:0});
    expect(onClickSpy).to.have.not.been.called;
    expect(navigateSpy).to.have.been.calledOnce;
    expect(navigateSpy).to.have.been.calledWith('section', {}, {});
  });

});
