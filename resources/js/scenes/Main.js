import React, { Component } from 'react';
import {
  Router, Switch
} from 'react-router-dom';

import {
  SuperAdminRoute,
  AuthenticatedRoute
} from '../components/PrivateRoutes';

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
import OrganizationDetail from './Organizations/detail';

import MemberAdd from './Members/add';
import MemberDetail from './Members/detail';

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
          <SuperAdminRoute path="/admin/home" name="Admin" component={Admin} />
          <SuperAdminRoute exact path="/create" name="AdminCreate" component={AdminCreate} />
          <SuperAdminRoute exact path="/federations" name="AdminFederation" component={AdminFederation} />
          <SuperAdminRoute exact path="/nfprofile" name="AdminNFProfile" component={AdminNFProfile} />
          <SuperAdminRoute exact path="/detail" name="AdminDetail" component={AdminDetail} />
          <SuperAdminRoute exact path="/search" name="Admin" component={AdminSearch} />
          <SuperAdminRoute exact path="/competitions" name="AdminCompetition" component={AdminCompetition} />
          <SuperAdminRoute exact path="/competition/detail" name="AdminCompDetail" component={AdminCompDetail} />
          <SuperAdminRoute exact path="/reset" name="AdminReset" component={AdminReset} />
          <SuperAdminRoute exact path="/setting" name="AdminSetting" component={AdminSetting} />
          <SuperAdminRoute exact path="/organization/detail" name="AdminOrganizationDetail" component={OrganizationDetail} />
          <SuperAdminRoute exact path="/member/detail" name="AdminMemberDetail" component={MemberDetail} />

          <AuthenticatedRoute exact path="/organization/create" name="OrganizationAdd" component={OrganizationAdd} />
          <AuthenticatedRoute exact path="/organization/detail" name="OrganizationDetail" component={OrganizationDetail} />

          <AuthenticatedRoute exact path="/member/register" name="MemberAdd" component={MemberAdd} />
          <AuthenticatedRoute exact path="/member/detail" name="MemberDetail" component={MemberDetail} />

          <AuthenticatedRoute exact path="/search" name="Search" component={Search} />
          <AuthenticatedRoute exact path="/reset" name="Reset" component={Reset} />
          <AuthenticatedRoute exact path="/" name="Dashboard" component={Dashboard} />
        </Switch>
      </Router>
    );
  }
}

export default Main;
