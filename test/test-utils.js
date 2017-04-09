import React, { Component, PropTypes } from 'react';
import { renderIntoDocument } from 'react-addons-test-utils';
import createRouter from 'router5';
import browserPlugin from 'router5/plugins/browser';
import { Provider as MobXProvider, inject } from 'mobx-react';
import { mobxPlugin, RouterStore } from 'mobx-router5';

// TODO: After (15.5)
// import TestUtils from 'react-dom/test-utils';
// Also the shallow renderer has been moved to react-test-renderer/shallow.
// import { createRenderer } from 'react-test-renderer/shallow';

const routerStore = new RouterStore();

@inject('routerStore')
class Child extends Component {
  render() {
    return (<div />);
  }
};

Child.wrappedComponent.propTypes = {
  routerStore: PropTypes.object.isRequired
};

export { Child };


export const FnChild = (props) => <div />;

export const createTestRouter = () => {
  return createRouter()
    .usePlugin(browserPlugin())
    .usePlugin(mobxPlugin(routerStore));
};


export const renderWithRouter = router => BaseComponent => renderIntoDocument(
  <MobXProvider ciao="hello" routerStore={routerStore}>
    <BaseComponent />
  </MobXProvider>
);
