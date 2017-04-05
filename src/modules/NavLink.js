import React, { Component, createElement } from 'react';
import withRoute from "./withRoute";

class NavLink extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render(){
    return React.createElement('li', {className: this.props.className}, this.props.children);
  }

}

export default withRoute(NavLink, true);
