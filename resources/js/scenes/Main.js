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
          <SuperAdminRoute path="/admin/create" name="AdminCreate" component={AdminCreate} />
          <SuperAdminRoute path="/admin/federations" name="AdminFederation" component={AdminFederation} />
          <SuperAdminRoute path="/admin/nfprofile" name="AdminNFProfile" component={AdminNFProfile} />
          <SuperAdminRoute path="/admin/detail" name="AdminDetail" component={AdminDetail} />
          <SuperAdminRoute path="/admin/search" name="Admin" component={AdminSearch} />
          <SuperAdminRoute path="/admin/competitions" name="AdminCompetition" component={AdminCompetition} />
          <SuperAdminRoute path="/admin/competition/detail" name="AdminCompDetail" component={AdminCompDetail} />
          <SuperAdminRoute path="/admin/reset" name="AdminReset" component={AdminReset} />
          <SuperAdminRoute path="/admin/setting" name="AdminSetting" component={AdminSetting} />
          <SuperAdminRoute path="/admin/organization/detail" name="AdminOrganizationDetail" component={OrganizationDetail} />
          <SuperAdminRoute path="/admin/member/detail" name="AdminMemberDetail" component={MemberDetail} />

          <AuthenticatedRoute path="/organization/create" name="OrganizationAdd" component={OrganizationAdd} />
          <AuthenticatedRoute path="/organization/detail" name="OrganizationDetail" component={OrganizationDetail} />

          <AuthenticatedRoute path="/member/register" name="MemberAdd" component={MemberAdd} />
          <AuthenticatedRoute path="/member/detail" name="MemberDetail" component={MemberDetail} />

          <AuthenticatedRoute path="/search" name="Search" component={Search} />
          <AuthenticatedRoute path="/reset" name="Reset" component={Reset} />
          <AuthenticatedRoute path="/" name="Dashboard" component={Dashboard} />
        </Switch>
      </Router>
    );
  }
}

export default Main;