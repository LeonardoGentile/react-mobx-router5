import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import jsdom from 'jsdom';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiEnzyme from 'chai-enzyme';

Enzyme.configure({ adapter: new Adapter() });

chai.use(sinonChai);
chai.use(chaiEnzyme());


// Setup for enzyme: http://airbnb.io/enzyme/docs/guides/jsdom.html
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>', {
  url: 'http://localhost'
});
const win = doc.defaultView;

// Setup for react test-utils 'renderIntoDocument':
// it requires window, window.document and window.document.createElement
// globally available before you can import React
global.document = doc;
global.window = win;

// Temp fix for https://github.com/chaijs/type-detect/issues/98
global.HTMLElement = win.HTMLElement;

global.navigator = {
  userAgent: 'node.js'
};
