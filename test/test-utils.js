import React, { Component, PropTypes } from 'react';
import { renderIntoDocument } from 'react-addons-test-utils';
import createRouter from 'router5';
import browserPlugin from 'router5/plugins/browser';
import { Provider as MobXProvider, inject } from 'mobx-react';

// TODO: After (15.5)
// import TestUtils from 'react-dom/test-utils';
// Also the shallow renderer has been moved to react-test-renderer/shallow.
// import { createRenderer } from 'react-test-renderer/shallow';

export const FnChild = (props) => <div />;

export class Child extends Component {
  render() {
    return (<div />);
  }
};

class BaseChild extends Component {
  render() {
    return (<div />);
  }
};
const ChildWithInjectedStore = inject("routerStore")(BaseChild);
ChildWithInjectedStore.wrappedComponent.propTypes = {
  routerStore: PropTypes.object.isRequired
};
export { ChildWithInjectedStore };


export const createTestRouter = () => {
  return createRouter()
    .usePlugin(browserPlugin());
};


export const renderWithRouterStore = (routerStore) => (ChildComponent) => renderIntoDocument(
  <MobXProvider routerStore={routerStore}>
    <ChildComponent />
  </MobXProvider>
);
