import jsdom from 'jsdom';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiEnzyme from 'chai-enzyme';

chai.use(sinonChai);
chai.use(chaiEnzyme());

// Initialize should
// chai.should();

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


// global.navigator = win.navigator;
global.navigator = {
  userAgent: 'node.js'
};
