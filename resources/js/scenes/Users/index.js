import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, FormGroup
} from 'reactstrap';
import {
  withRouter
} from 'react-router-dom';
import { Input } from 'semantic-ui-react';
import Select from 'react-select';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import InviteTable from '../../components/InviteTable';
import ActiveUserTable from '../../components/ActiveUserTable';

import { OrganizationType } from '../../configs/data';

class GetInviteUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inviteOrgtype: '',
      changeOrgtype: '',
      orgs: [],
      init_orgs: [],
      members: [],
      init_members: [],
      temp_members: [],
      filter_members: '',
      users: [],
      init_users: [],
      temp_users: [],
      filter_users: ''
    };

    if (OrganizationType.length == 3) OrganizationType.splice(0, 0, { label: 'All', value: '' });
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const parent_id = user.user.member_info.organization_id;

    const org_response = await Api.get(`organization-list/${parent_id}`);
    switch (org_response.response.status) {
      case 200:
        const orgArr = [];

        for (let i = 1; i < org_response.body.length; i++) {
          orgArr.push(org_response.body[i].name_o);
        }

        const orgList = orgArr.map((org, Index) => <option key={Index} value={org} />);

        this.setState({
          orgs: orgList,
          init_orgs: org_response.body
        });
        break;
      default:
        break;
    }

    const data = await Api.get('invite-users');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          init_members: body.members,
          temp_members: body.members,
          members: body.members,
          init_users: body.users,
          users: body.users
        });
        break;
      case 406:
        break;
      default:
        break;
    }
  }

  handleInviteOrgFilter(value) {
    let filter;
    let filter_members = [];

    if (value === '') {
      filter_members = this.state.temp_members;
    } else {
      filter = this.state.init_orgs.filter(org => org.name_o.toUpperCase() == value.toUpperCase());

      if (filter.length > 0) filter_members = this.state.temp_members.filter(obj => obj.organization_id == filter[0].id);
    }

    this.setState({
      members: filter_members
    });
  }

  handleSelectInvite(data) {
    const { value } = data;

    let filtered = [];

    switch (value) {
      case 'nf':
        filtered = this.state.init_members.filter(obj => obj.parent_id == 0);

        break;
      case 'ref':
        filtered = this.state.init_members.filter(obj => obj.parent_id == 1);

        break;
      case 'club':
        filtered = this.state.init_members.filter(obj => obj.is_club == 1);

        break;
      default:
        filtered = this.state.init_members;

        break;
    }

    this.setState({
      inviteOrgtype: data,
      members: filtered,
      temp_members: filtered,
      filter_members: ''
    });
  }

  handleFilterInvite(evt, data) {
    this.setState({
      filter_members: data.value
    });

    const { init_members } = this.state;

    let filtered = [];

    if (this.state.temp_members.length === 0) {
      this.setState({
        temp_members: init_members
      });
    }

    filtered = this.state.temp_members.filter(
      obj => obj.name.toUpperCase().includes(data.value.toUpperCase())
               || obj.surname.toUpperCase().includes(data.value.toUpperCase())
    );

    this.setState({
      members: filtered
    });
  }

  handleChangeOrgFilter(value) {
    let filter;
    let filter_users = [];

    if (value === '') {
      filter_users = this.state.filter_users;
    } else {
      filter = this.state.init_orgs.filter(org => org.name_o.toUpperCase() == value.toUpperCase());

      if (filter.length > 0) filter_members = this.state.filter_users.filter(obj => obj.organization_id == filter[0].id);
    }

    this.setState({
      users: filter_users
    });
  }

  handleSelectChange(data) {
    const { value } = data;

    let filtered = [];

    switch (value) {
      case 'nf':
        filtered = this.state.init_users.filter(obj => obj.parent_id == 0);

        break;
      case 'ref':
        filtered = this.state.init_users.filter(obj => obj.parent_id == 1);

        break;
      case 'club':
        filtered = this.state.init_users.filter(obj => obj.is_club == 1);

        break;
      default:
        filtered = this.state.init_users;

        break;
    }

    this.setState({
      changeOrgtype: data,
      users: filtered,
      temp_users: filtered,
      filter_users: ''
    });
  }

  handleFilterChange(evt, data) {
    this.setState({
      filter_users: data.value
    });

    let filtered = [];

    if (this.state.temp_users.length === 0) {
      this.setState({
        temp_users: this.state.init_users
      });
    }

    filtered = this.state.temp_users.filter(
      obj => obj.name.toUpperCase().includes(data.value.toUpperCase())
               || obj.surname.toUpperCase().includes(data.value.toUpperCase())
    );

    this.setState({
      users: filtered
    });
  }

  render() {
    const {
      inviteOrgtype,
      changeOrgtype,
      orgs,
      members,
      users,
      filter_members,
      filter_users
    } = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
        {
          members && members.length > 0 && (
            <Container fluid>
              <Row className="my-2">
                <Col lg="2" md="3" sm="4">
                  <FormGroup>
                    <Select
                      name="inviteOrgtype"
                      classNamePrefix={'react-select-lg'}
                      value={inviteOrgtype}
                      options={OrganizationType}
                      onChange={this.handleSelectInvite.bind(this)}
                    />
                  </FormGroup>
                </Col>
                {
                  inviteOrgtype.value !== 'nf' && (
                    <Col lg="2" md="3" sm="4">
                      <FormGroup>
                        <Input
                          className="club-list"
                          list="orgs"
                          type="text"
                          placeholder="Regional Federation"
                          onChange={event => this.handleInviteOrgFilter(event.target.value)}
                        />
                        <datalist id="orgs">
                          {orgs}
                        </datalist>
                      </FormGroup>
                    </Col>
                  )
                }
                <Col lg="2" md="3" sm="4">
                  <FormGroup>
                    <Input
                      value={filter_members}
                      icon="search"
                      placeholder="Search Invite Users"
                      onChange={this.handleFilterInvite.bind(this)}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <div className="table-responsive">
                <InviteTable
                  items={members}
                />
              </div>
            </Container>
          )
        }
        {
          users && users.length > 0 && (
            <Container fluid>
              <Row className="mt-5 mb-2">
                <Col lg="2" md="3" sm="4">
                  <FormGroup>
                    <Select
                      name="changeOrgtype"
                      classNamePrefix={'react-select-lg'}
                      value={changeOrgtype}
                      options={OrganizationType}
                      onChange={this.handleSelectChange.bind(this)}
                    />
                  </FormGroup>
                </Col>
                {
                  changeOrgtype.value !== 'nf' && (
                    <Col lg="2" md="3" sm="4">
                      <FormGroup>
                        <Input
                          className="club-list"
                          list="orgs"
                          type="text"
                          placeholder="Regional Federation"
                          onChange={event => this.handleChangeOrgFilter(event.target.value)}
                        />
                        <datalist id="orgs">
                          {orgs}
                        </datalist>
                      </FormGroup>
                    </Col>
                  )
                }
                <Col lg="2" md="3" sm="4">
                  <FormGroup>
                    <Input
                      value={filter_users}
                      icon="search"
                      placeholder="Search Users"
                      onChange={this.handleFilterChange.bind(this)}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <div className="table-responsive">
                <ActiveUserTable
                  items={users}
                />
              </div>
            </Container>
          )
        }
        </div>
      </Fragment>
    );
  }
}

export default withRouter(GetInviteUsers);
