import React from "react";
import {findRenderedComponentWithType} from "react-addons-test-utils";
import {expect} from "chai";
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

  it('should render an hyperlink element', () => {
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
    router.setOption('defaultRoute', 'home');
    router.start();
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

});
