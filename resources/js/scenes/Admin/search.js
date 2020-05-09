/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import { 
  Container, Row, Col,
  FormGroup, FormFeedback, Button
} from 'reactstrap';
import Select from 'react-select';
import QueryString from 'qs';
import Api from '../../apis/app';

import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import DataTable from '../../components/DataTable';
import {
  Dans, search_genders, search_type_options, member_type_options, referee_type_options
} from '../../configs/data';

class Search extends Component {
  constructor(props) {
    super(props);

    if (referee_type_options.length == 3) {
      referee_type_options.splice(0, 0, { label: 'All Referee', value: 'all' });
    }

    this.state = {
      nf_id: '',
      nf: [],
      orgs: [],
      org_list: [],
      original_clubs: [],
      clubs: [],
      member_type: '',
      referee_type: referee_type_options[0],
      search_required: true,
      member_required: true,
      search_type: '',
      search_org: '',
      search_club: '',
      search_gender: search_genders[0],
      search_dan: '',
      search_data: null,
      errors: {
        required: 'This field is required!'
      }
    }

    this.handleSearchFilter = this.handleSearchFilter.bind(this);
    this.search = this.search.bind(this);
  }

  async componentDidMount() {
    let nf_id = JSON.parse(localStorage.getItem('nf_id'));

    this.setState({
      nf_id
    });

    const nf = await Api.get(`organization/${nf_id}`);

    switch (nf.response.status) {
      case 200:
        this.setState({
          nf: nf.body
        });
        break;
      default:
        break;
    }

    const search = QueryString.parse(this.props.location.search, { ignoreQueryPrefix: true });
    
    if (this.isEmpty(search)) {
      let params = {
        item: nf_id,
        stype: 'org',
        org: '',
        club: '',
        mtype: '',
        rtype: 'all',
        gender: 0,
        dan: ''
      }

      this.search(params);
    } else {
      let params = {
        item: nf_id,
        stype: search.stype,
        org: search.org,
        club: search.club,
        mtype: search.stype == 'member' ? search.mtype : '',
        rtype: search.stype == 'member' ? search.rtype : '',
        gender: search.stype == 'member' ? search.gender : '',
        dan: search.mtype == 'judoka' ? search.dan : ''
      }

      const org_response = await Api.get(`organization-list/${nf_id}`);
      const { response, body } = org_response;
      switch (response.status) {
        case 200:
          if (body.length > 0 && body[0].parent_id == 0)
            body[0].name_o = "National Federation";

          this.setState({
            orgs: body.filter(org => org.parent_id != 0),
            org_list: body
          });
          break;
        default:
          break;
      }
      
      const club_list = await Api.get(`club-list/${nf_id}`);
      switch (club_list.response.status) {
        case 200:
          const search = QueryString.parse(this.props.location.search, { ignoreQueryPrefix: true });

          if (search.org == '') {
            this.setState({
              original_clubs: club_list.body,
              clubs: club_list.body,
              club_list: club_list.body
            });
          } else {
            this.setState({
              original_clubs: club_list.body,
              clubs: club_list.body.filter(club => club.parent_id == search.org),
              club_list: club_list.body
            });
          }
          break;
        default:
          break;
      }

      const role_list = await Api.get('roles');
      switch (role_list.response.status) {
        case 200:
          this.setState({
            roles: role_list.body
          });
          if (role_list.body.length > 0) {
            localStorage.setItem('roles', JSON.stringify(role_list.body));
          }
          break;
        default:
          break;
      }

      this.setState({
        search_type: search.stype ? (search_type_options.find(type => type.value == search.stype) || '') : '',
        search_org: search.org ? (org_response.body.find(org => org.id == search.org) || '') : '',
        search_club: search.club ? (club_list.body.find(club => club.id == search.club) || '') : '',
        member_type: search.mtype ? (member_type_options.find(option => option.value == search.mtype) || '') : '',
        referee_type: search.rtype 
          ? (referee_type_options.find(option => option.value == search.rtype) || referee_type_options[0]) 
          : referee_type_options[0],
        search_gender: search.gender
          ? (search_genders.find(gender => gender.value == search.gender) || search_genders[0])
          : search_genders[0],
        search_dan: search.dan ? (Dans.find(dan => dan.value == search.dan) || '') : '',
        search_data: null
      });

      this.search(params);
    }
  }

  async componentWillReceiveProps() {
    const search = QueryString.parse(window.location.search, { ignoreQueryPrefix: true });

    this.setState({
      search_type: search.stype ? (search_type_options.find(type => type.value == search.stype) || '') : '',
      search_org: search.org ? (this.state.org_list.find(org => org.id == search.org) || '') : '',
      search_club: search.club ? (this.state.club_list.find(club => club.id == search.club) || '') : '',
      member_type: search.mtype ? (member_type_options.find(option => option.value == search.mtype) || '') : '',
      referee_type: search.rtype 
        ? (referee_type_options.find(option => option.value == search.rtype) || referee_type_options[0]) 
        : referee_type_options[0],
      search_gender: search.gender
        ? (search_genders.find(gender => gender.value == search.gender) || search_genders[0])
        : search_genders[0],
      search_dan: search.dan ? (Dans.find(dan => dan.value == search.dan) || '') : '',
      search_data: null
    });

    let params = {};

    if (this.isEmpty(search)) {
      params = {
        item: this.state.nf_id,
        stype: 'org',
        org: '',
        club: '',
        mtype: '',
        rtype: 'all',
        gender: 0,
        dan: ''
      }
    } else {
      params = {
        item: this.state.nf_id,
        stype: search.stype,
        org: search.org,
        club: search.club,
        mtype: search.stype == 'member' ? search.mtype : '',
        rtype: search.stype == 'member' ? search.rtype : '',
        gender: search.stype == 'member' ? search.gender : '',
        dan: search.mtype == 'judoka' ? search.dan : ''
      }
    }

    this.search(params);
  }

  isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  }

  async handleSearchFilter(type, value) {
    switch (type) {
      case 'search_type':
        this.setState({
          search_type: value,
          search_required: true,
          search_org: '',
          search_club: '',
          member_type: '',
          search_data: null
        });

        const org_response = await Api.get(`organization-list/${this.state.nf_id}`);
        const { response, body } = org_response;
        switch (response.status) {
          case 200:
            if (body.length > 0 && body[0].parent_id == 0)
              body[0].name_o = "National Federation";

            this.setState({
              orgs: body.filter(org => org.parent_id != 0),
              org_list: body
            });
            break;
          default:
            break;
        }

        if (value.value == 'club' || value.value == 'member') {
          const club_list = await Api.get(`club-list/${this.state.nf_id}`);
          switch (club_list.response.status) {
            case 200:
              const search = QueryString.parse(this.props.location.search, { ignoreQueryPrefix: true });

              if (search.org === undefined || search.org == '') {
                this.setState({
                  original_clubs: club_list.body,
                  clubs: club_list.body,
                  club_list: club_list.body
                });
              } else {
                this.setState({
                  original_clubs: club_list.body,
                  clubs: club_list.body.filter(club => club.parent_id == search.org),
                  club_list: club_list.body
                });
              }
              break;
            default:
              break;
          }
        }

        break;
      case 'search_org':
        let filtered = [];

        if (value == null) {
          filtered = this.state.original_clubs
        } else {
          filtered = this.state.original_clubs.filter(club => club.parent_id == value.id)
        }

        const clubsFiltered = filtered;

        this.setState({
          search_org: value,
          clubs: clubsFiltered,
          search_club: '',
          search_data: null
        });
        break;
      case 'search_club':
        this.setState({
          search_club: value,
          search_data: null
        });
        break;
      case 'member_type':
        this.setState({
          member_type: value,
          search_required: true,
          member_required: true,
          search_data: null
        });
        break;
      case 'referee_type':
        this.setState({
          referee_type: value,
          search_required: true,
          member_required: true,
          search_data: null
        });
        break;
      case 'search_gender':
        this.setState({
          search_gender: value,
          search_data: null
        });
        break;
      case 'search_dan':
        this.setState({
          search_dan: value,
          search_data: null
        });
        break;
      default:
        break;
    }
  }

  async handleSearch() {
    const {
      search_type, search_org, search_club, member_type, referee_type, search_gender, search_dan
    } = this.state;

    const search_params = {
      item: this.state.nf_id,
      stype: search_type ? search_type.value : '',
      org: search_org ? search_org.id : '',
      club: search_club ? search_club.id : '',
      mtype: member_type ? member_type.value : '',
      rtype: referee_type ? referee_type.value : '',
      gender: search_gender ? search_gender.value : search_genders[0],
      dan: search_dan ? search_dan.value : ''
    };

    if (!search_params.stype) {
      this.setState({
        search_required: false
      });
      return;
    }

    if (search_params.stype == 'member' && !search_params.mtype) {
      this.setState({
        member_required: false
      });
      return;
    }

    this.search(search_params);

    this.props.history.push(`/admin/search${QueryString.stringify(search_params, { addQueryPrefix: true })}`);
  }

  async search(search_params) {
    const search_response = await Api.get('search', search_params);
    const { response, body } = search_response;

    switch (response.status) {
      case 200:
        this.setState({
          search_data: body
        });
        break;
      default:
        break;
    }
  }

  handleSelectItem(id) {
    const { search_type } = this.state;
    if (search_type.value == 'member') {
      this.props.history.push('/admin/member/detail', id);
    } else {
      this.props.history.push('/admin/organization/detail', id);
    }
  }

  render() {
    const { 
      nf,
      orgs,
      org_list,
      clubs,
      search_required,
      member_required,
      search_type,
      search_org,
      search_club,
      search_gender,
      search_dan,
      member_type,
      referee_type,
      search_data,
      errors
    } = this.state;

    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <div className="content">
              <Container fluid>
                {nf.name_o != '' && (
                  <h3 className="text-danger text-center my-3">
                    Welcome to { nf.name_o }
                  </h3>
                )}

                <Row>
                  <Col xl="2" lg="3" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        name="search_type"
                        className="select-box"
                        classNamePrefix={!search_required ? 'invalid react-select-lg' : 'react-select-lg'}
                        placeholder="Search Type"
                        indicatorSeparator={null}
                        value={search_type}
                        options={search_type_options}
                        getOptionValue={option => option.value}
                        getOptionLabel={option => option.label}
                        onChange={(type) => {
                          this.handleSearchFilter('search_type', type);
                        }}
                      />
                      {
                        !search_required && (
                          <FormFeedback className="d-block">{errors.required}</FormFeedback>
                        )
                      }
                    </FormGroup>
                  </Col>
                  {
                    search_type.value == 'org' && (
                      <Col xl="3" lg="3" md="4" sm="6" xs="12">
                        <FormGroup>
                          <Select
                            name="search_org"
                            className="select-box"
                            classNamePrefix="react-select-lg"
                            placeholder="Organization Name"
                            isClearable
                            value={search_org}
                            options={orgs}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name_o}
                            onChange={(org) => {
                              this.handleSearchFilter('search_org', org);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    )
                  }
                  {
                    (search_type.value == 'club' || search_type.value == 'member') && (
                      <Col xl="2" lg="3" md="4" sm="6" xs="12">
                        <FormGroup>
                          <Select
                            name="search_org"
                            className="select-box"
                            classNamePrefix="react-select-lg"
                            placeholder="Org Search"
                            isClearable
                            value={search_org}
                            options={org_list}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name_o}
                            onChange={(org) => {
                              this.handleSearchFilter('search_org', org);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    )
                  }
                  {
                    (search_type.value == 'club' || search_type.value == 'member') && (
                      <Col xl="2" lg="3" md="4" sm="6" xs="12">
                        <FormGroup>
                          <Select
                            name="search_club"
                            className="select-box"
                            classNamePrefix="react-select-lg"
                            placeholder="Club Name"
                            isClearable
                            value={search_club}
                            options={clubs}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name_o}
                            onChange={(club) => {
                              this.handleSearchFilter('search_club', club);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    )
                  }
                  {
                    search_type.value == 'member' && (
                      <Col xl="2" lg="3" md="4" sm="6" xs="12">
                        <FormGroup>
                          <Select
                            name="member_type"
                            className="select-box"
                            classNamePrefix={!member_required ? 'invalid react-select-lg' : 'react-select-lg'}
                            placeholder="Member Type"
                            value={member_type}
                            options={member_type_options}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            onChange={(type) => {
                              this.handleSearchFilter('member_type', type);
                            }}
                          />
                          {
                            !member_required && (
                              <FormFeedback className="d-block">{errors.required}</FormFeedback>
                            )
                          }
                        </FormGroup>
                      </Col>
                    )
                  }
                  {
                    search_type.value == 'member' && member_type.value == 'referee' && (
                      <Col xl="2" lg="3" md="4" sm="6" xs="12">
                        <FormGroup>
                          <Select
                            name="referee_type"
                            className="select-box"
                            classNamePrefix="react-select-lg"
                            placeholder="Referee Type"
                            value={referee_type}
                            options={referee_type_options}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            onChange={(type) => {
                              this.handleSearchFilter('referee_type', type);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    )
                  }
                  {
                    search_type.value == 'member' && member_type.value == 'judoka' && (
                      <Fragment>
                        <Col xl="2" lg="2" md="4" sm="6" xs="12">
                          <FormGroup>
                            <Select
                              name="search_gender"
                              className="select-box"
                              classNamePrefix="react-select-lg"
                              placeholder="Gender"
                              value={search_gender}
                              options={search_genders}
                              getOptionValue={option => option.value}
                              getOptionLabel={option => option.label}
                              onChange={(gender) => {
                                this.handleSearchFilter('search_gender', gender);
                              }}
                            />
                          </FormGroup>
                        </Col>
                        <Col xl="1" lg="2" md="2" sm="6" xs="12">
                          <FormGroup>
                            <Select
                              name="search_dan"
                              className="select-box"
                              classNamePrefix="react-select-lg"
                              placeholder="Dan"
                              value={search_dan}
                              options={Dans}
                              getOptionValue={option => option.value}
                              getOptionLabel={option => option.label}
                              onChange={(dan) => {
                                this.handleSearchFilter('search_dan', dan);
                              }}
                            />
                          </FormGroup>
                        </Col>
                      </Fragment>
                    )
                  }
                  <Col xl="1" lg="3" md="4" sm="6" xs="12">
                    <div className="text-right">
                      <FormGroup>
                        <Button
                          type="button"
                          color="warning"
                          className="btn-lg"
                          onClick={this.handleSearch.bind(this)}
                        >
                          Search
                        </Button>
                      </FormGroup>
                    </div>
                  </Col>
                </Row>
              </Container>
              {
                search_data && search_data.length == 0 && (
                  <div className="fixed-content">
                    <h3 className="text-muted text-center">
                      No results!
                    </h3>
                  </div>
                )
              }
              {
                search_data && search_data.length > 0 && (
                  <Container fluid>
                    <div className="table-responsive">
                      <DataTable
                        stype={search_type}
                        mtype={member_type}
                        items={search_data}
                        display={false}
                        onSelect={this.handleSelectItem.bind(this)}
                      />
                    </div>
                  </Container>
                )
              }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Search);