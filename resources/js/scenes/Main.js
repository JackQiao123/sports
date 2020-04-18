import React, { Component } from 'react';
import {
  Router, Switch, Route
} from 'react-router-dom';

import history from '../history';

import Admin from './Admin';
import AdminCreate from './Admin/create';
import AdminFederation from './Admin/federations';
import AdminNFProfile from './Admin/federationprofile';
import AdminDetail from './Admin/detail';
import AdminSearch from './Admin/search';
import AdminCompetition from './Admin/competitions';
import AdminCompDetail from './Admin/compdetail';
import AdminReset from './Admin/reset';
import AdminSetting from './Admin/setting';

import OrganizationAdd from './Organizations/add';

import MemberAdd from './Members/add';

import Dashboard from './Dashboard';
import Search from './Dashboard/search';
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
          <Route exact path="/admin/nfprofile" name="AdminNFProfile" component={AdminNFProfile} />
          <Route exact path="/admin/detail" name="AdminDetail" component={AdminDetail} />
          <Route exact path="/admin/search" name="Admin" component={AdminSearch} />
          <Route exact path="/admin/competitions" name="AdminCompetition" component={AdminCompetition} />
          <Route exact path="/admin/competition/detail" name="AdminCompDetail" component={AdminCompDetail} />
          <Route exact path="/admin/reset" name="AdminReset" component={AdminReset} />
          <Route exact path="/admin/setting" name="AdminSetting" component={AdminSetting} />

          <Route exact path="/organization/create" name="OrganizationAdd" component={OrganizationAdd} />

          <Route exact path="/member/register" name="MemberAdd" component={MemberAdd} />

          <Route exact path="/search" name="Search" component={Search} />
          <Route exact path="/reset" name="Reset" component={Reset} />
          <Route exact path="/" name="Dashboard" component={Dashboard} />
        </Switch>
      </Router>
    );
  }
}

export default Main;
