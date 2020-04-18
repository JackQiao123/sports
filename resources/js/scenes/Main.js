import React, { Component } from 'react';
import {
  Router, Switch, Route
} from 'react-router-dom';

import history from '../history';

import Admin from './Admin';
import AdminCreate from './Admin/create';
import AdminFederation from './Admin/federations';

import Dashboard from './Dashboard';
import Reset from './Users/reset';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {}
  }

  componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    
    if (user.user.is_super == 1) {
      document.body.classList.add('admin');
    } else {
      document.body.classList.remove('admin');
    }
  }

  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/admin/home" name="Admin" component={Admin} />
          <Route exact path="/admin/create" name="AdminCreate" component={AdminCreate} />
          <Route exact path="/admin/federations" name="AdminFederation" component={AdminFederation} />

          <Route exact path="/reset" name="Reset" component={Reset} />
          <Route exact path="/" name="Dashboard" component={Dashboard} />
        </Switch>
      </Router>
    );
  }
}

export default Main;
