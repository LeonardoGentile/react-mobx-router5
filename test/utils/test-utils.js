import React, { Component, PropTypes } from 'react';
import { renderIntoDocument } from 'react-addons-test-utils';
import createRouter from 'router5';
import browserPlugin from 'router5/plugins/browser';
import { Provider as MobXProvider, inject } from 'mobx-react';
import {mount} from "enzyme";

// TODO: After (15.5)
// import TestUtils from 'react-dom/test-utils';
// Also the shallow renderer has been moved to react-test-renderer/shallow.
// import { createRenderer } from 'react-test-renderer/shallow';

const FnComp = (props) => <div id="fn-child" />;
FnComp.displayName = 'FnChild';
export {FnComp}


class Child extends Component {
  render() {
    return (<div id="child-comp">{this.props.children}</div>);
  }
};
Child.displayName = 'Child';
export {Child}


export const createTestRouter = () => {
  return createRouter()
    .usePlugin(browserPlugin());
};


export const renderWithProvider = (routerStore) => (ChildComponent) => renderIntoDocument(
  <MobXProvider routerStore={routerStore}>
    <ChildComponent />
  </MobXProvider>
);


export const renderWithStore = (routerStore) => (Component) => mount(
  <Component routerStore={routerStore}/>
);
