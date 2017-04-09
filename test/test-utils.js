import createRouter from 'router5';
import React, { Component, PropTypes } from 'react';
import { Provider as MobXProvider} from 'mobx-react';

// TODO: After (15.5)
// import TestUtils from 'react-dom/test-utils';
//
// The shallow renderer has been moved to react-test-renderer/shallow.
// Before (15.4 and below)
// import { createRenderer } from 'react-addons-test-utils';
// After (15.5)
// import { createRenderer } from 'react-test-renderer/shallow';

import { renderIntoDocument } from 'react-addons-test-utils';
import browserPlugin from 'router5/plugins/browser';

export class Child extends Component {
    render() {
        return <div />;
    }
}

Child.contextTypes = {
    router: PropTypes.object.isRequired
};

export const FnChild = (props) => <div />;

export const createTestRouter = () => createRouter().usePlugin(browserPlugin());

export const renderWithRouter = router => BaseComponent => renderIntoDocument(
    <MobXProvider router={ router }>
        <BaseComponent />
    </MobXProvider>
);
