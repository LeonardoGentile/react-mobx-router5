import React, {Component} from 'react';
import {mount} from 'enzyme';
import {createRouter} from 'router5';
import browserPlugin from 'router5/plugins/browser';
import {Provider as MobXProvider} from 'mobx-react';


const FnComp = (props) => <div id="fn-child" />;
FnComp.displayName = 'FnChild';
export {FnComp};


class Child extends Component {
  render() {
    return (<div id="child-comp">{this.props.children}</div>);
  }
}
Child.displayName = 'Child';
export {Child};


export const createTestRouter = (routes=null) => {
  return createRouter(routes)
    .usePlugin(browserPlugin());
};


export const renderWithProvider = (routerStore) => (ChildComponent) => mount(
  <MobXProvider routerStore={routerStore}>
    <ChildComponent />
  </MobXProvider>
);


export const renderWithStore = (routerStore) => (Component) => mount(
  <Component routerStore={routerStore}/>
);
