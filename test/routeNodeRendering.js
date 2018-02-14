import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {mobxPlugin, RouterStore} from 'mobx-router5';
import {createTestRouter, FnComp} from './utils/test-utils';
import routeNode from '../src/modules/routeNode';
import {spy} from 'sinon';

const routes = [
  {
    name: 'app',
    path: '/',
    children: [
      {
        name: 'a',
        path: 'a/:id',
        children: [
          {
            name: 'a1',
            path: '/a1'
          },
          {
            name: 'a2',
            path: '/a2'
          },
          {
            name: 'a3',
            path: '/a3'
          }
        ],
      },
      {
        name: 'b',
        path: 'b/:id',
        children: [
          {
            name: 'b1',
            path: '/b1'
          },
          {
            name: 'b2',
            path: '/b2'
          },
          {
            name: 'b3',
            path: '/b3'
          }
        ],
      }
    ]
  }
];


const CompA = (props) => {
  const segment = props.route.name.split('.')[1];
  let Comp = null;
  switch (segment) {
    case 'a1':
      Comp = <CompA1/>;
      break;
    case 'a2':
      Comp = <CompA2/>;
      break;
    case 'a3':
      Comp = <CompA3/>;
      break;
    default:
      Comp = <h1>Error in CompA</h1>;
      break;
  }
  return (
    <div>
      <Comp id='CompA'/>
    </div>
  )
};
CompA.displayName = 'CompA';


const CompB = (props) => {
  const segment = props.route.name.split('.')[1];
  let Comp = null;
  switch (segment) {
    case 'b1':
      Comp = <CompA1/>;
      break;
    case 'b2':
      Comp = <CompA2/>;
      break;
    case 'b3':
      Comp = <CompA3/>;
      break;
    default:
      Comp = <h1>Error in CompB</h1>;
      break;
  }
  return (
    <div>
      <Comp id='CompB'/>
    </div>
  )
};
CompB.displayName = 'CompB';


const CompA1 = (props) => <div id="A1"/>;
CompA1.displayName = 'CompC';

const CompA2 = (props) => <div id="A2"/>;
CompA2.displayName = 'CompA2';

const CompA3 = (props) => <div id="A3"/>;
CompA1.displayName = 'CompA3';

const CompB1 = (props) => <div id="B1"/>;
CompB1.displayName = 'CompB1';

const CompB2 = (props) => <div id="B2"/>;
CompB2.displayName = 'CompB2';

const CompB3 = (props) => <div id="B3"/>;
CompB3.displayName = 'CompB3';

const RouterA = routeNode('a')(CompA);
const RouterB = routeNode('b')(CompB);

const CompRoot = (props) => {
  const segment = props.route.name.split('.')[0];
  let Comp = null;
  switch (segment) {
    case 'a':
      Comp = <RouterA />;
      break;
    case 'b':
      Comp = <RouterB/>;
      break;
    default:
      Comp = <h1>Error in CompRoot</h1>;
      break;
  }
  return (
    <div id='CompRoot'>
      <Comp/>
    </div>
  )
};
CompRoot.displayName = 'CompRoot';





describe('routeNode hoc', () => {
  let router;
  let routerStore;
  let RootRouter;

  before(() => {
    router = createTestRouter(routes);
    routerStore = new RouterStore();
    router.usePlugin(mobxPlugin(routerStore));
    RootRouter = routeNode('')(CompRoot);
  });


  context('Children re-rendering', function() {

    it('Should re-render its children', () => {
      router.setOption('defaultRoute', 'a.a1');
      router.setOption('defaultParams', {'id': 1});
      router.start('/', function() {
        const previousRoute = router.getState();
        navigateTo('a.a2', {id: 1}, previousRoute);
      });

      function navigateTo(nextRoute, nextRouteParams, previousRoute) {
        router.navigate(nextRoute, nextRouteParams, {}, function() {
          const output = mount(
            <RootRouter routerStore={routerStore}/>
          );
          expect(output.find('#CompRoot').to.have.length(1));

        });
      }

    });
  });

});
