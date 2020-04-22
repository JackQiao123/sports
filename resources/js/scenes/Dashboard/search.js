/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import Select from 'react-select';
import {
  Container,
  Row,
  Col,
  FormGroup,
  Button,
  FormFeedback,
  Alert
} from 'reactstrap';
import { Input } from 'semantic-ui-react';

import QueryString from 'qs';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import DataTable from '../../components/DataTable';
import Prompt from '../../components/Prompt';
import EditModal from '../../components/EditModal';
import {
  Dans, search_genders, search_type_options, member_type_options, referee_type_options
} from '../../configs/data';

class Search extends Component {
  constructor(props) {
    super(props);

    const user = JSON.parse(localStorage.getItem('auth'));
    const me = user.user.member_info.organization_id;

    if (member_type_options.length === 5) {
      member_type_options.shift();
    }

    if (referee_type_options.length == 3) {
      referee_type_options.splice(0, 0, { label: 'All Referee', value: 'all' });
    }

    this.state = {
      me,
      level: user.user.level,
      user_is_club: user.user.is_club_member == 1 ? true : false,
      org_list: [],
      orgs: [],
      weights: [],
      roles: [],
      club_list: [],
      clubs: [],
      original_clubs: [],
      search_required: true,
      member_required: true,
      search_type: '',
      member_type: '',
      filter: '',
      referee_type: referee_type_options[0],
      search_org: '',
      search_club: '',
      search_gender: search_genders[0],
      search_weight: '',
      search_dan: '',
      search_data: null,
      init: false,
      isOpenDeleteModal: false,
      isOpenEditModal: false,
      edit_item: '',
      confirmationMessage: '',
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: '',
      deleteId: '',
      editIndex: -1,
      errors: {
        required: 'This field is required!'
      }
    };

    this.handleSearchFilter = this.handleSearchFilter.bind(this);
    this.handleDeleteMember = this.handleDeleteMember.bind(this);
    this.handleConfirmationClose = this.handleConfirmationClose.bind(this);
    this.handleSaveItem = this.handleSaveItem.bind(this);
    this.getWeights = this.getWeights.bind(this);
    this.search = this.search.bind(this);
    this.searchAction = this.searchAction.bind(this);
  }

  async searchAction() {
    const search = QueryString.parse(this.props.location.search, { ignoreQueryPrefix: true });

    if (this.isEmpty(search)) {
      if (this.state.level == 1) {
        let params = {
          stype: 'org',
          org: '',
          club: '',
          mtype: '',
          rtype: 'all',
          gender: 0,
          weight: '',
          dan: ''
        }

        this.search(params);
      } else if (this.state.user_is_club != 1) {
        let params = {
          stype: 'club',
          org: this.state.me,
          club: '',
          mtype: '',
          rtype: 'all',
          gender: 0,
          weight: '',
          dan: ''
        }

        this.search(params);
      } else if (this.state.user_is_club == 1) {
        let params = {
          stype: 'member',
          org: this.state.me,
          club: '',
          mtype: 'judoka',
          rtype: 'all',
          gender: 0,
          weight: '',
          dan: ''
        }

        this.setState({
          init: true
        });

        this.search(params);
      }
    } else {
      let params = {
        stype: search.stype,
        org: this.state.level == 1 ? search.org : this.state.me,
        club: search.club,
        mtype: search.stype == 'member' ? search.mtype : '',
        rtype: search.stype == 'member' ? search.rtype : '',
        gender: search.stype == 'member' ? search.gender : '',
        weight: search.mtype == 'judoka' ? search.weight : '',
        dan: search.mtype == 'judoka' ? search.dan : ''
      }

      const user = JSON.parse(localStorage.getItem('auth'));
      const parent_id = user.user.member_info.organization_id;

      const org_response = await Api.get(`organization-list/${parent_id}`);
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
      
      const club_list = await Api.get(`club-list/${parent_id}`);
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

      const weight_list = await Api.get('weights');
      switch (weight_list.response.status) {
        case 200:
          this.setState({
            weights: weight_list.body
          });
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
        search_weight: search.weight ? (weight_list.body.find(weight => weight.id == search.weight) || '') : '',
        search_dan: search.dan ? (Dans.find(dan => dan.value == search.dan) || '') : '',
        search_data: null
      });

      this.search(params);
    }
  }

  componentDidMount() {
    this.componentWillReceiveProps();
  }

  async componentWillReceiveProps() {
    this.searchAction();
    
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

        const user = JSON.parse(localStorage.getItem('auth'));
        const parent_id = user.user.member_info.organization_id;

        const org_response = await Api.get(`organization-list/${parent_id}`);
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
          const club_list = await Api.get(`club-list/${parent_id}`);
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
      case 'search_name':
        let { members } = this.state;

        members = members.filter(
          member => member.name.toUpperCase().includes(value.toUpperCase()) || 
                    member.surname.toUpperCase().includes(value.toUpperCase()));

        this.setState({
          filter: value,
          search_data: members
        });
        break;
      case 'member_type':
        if (value.value == 'judoka') {
          const weight_list = await Api.get('weights');
          switch (weight_list.response.status) {
            case 200:
              this.setState({
                weights: weight_list.body
              });
              break;
            default:
              break;
          }
        }

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
      case 'search_weight':
        this.setState({
          search_weight: value,
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
      search_type, search_org, search_club,
      member_type, referee_type, 
      search_gender, search_weight, search_dan,
      level, me, user_is_club
    } = this.state;

    const search_params = {
      stype: search_type ? search_type.value : user_is_club ? 'member' : '',
      org: level == 1 ? (search_org ? search_org.id : '') : me,
      club: search_club ? search_club.id : '',
      mtype: member_type ? member_type.value : '',
      rtype: referee_type ? referee_type.value : 'all',
      gender: search_gender ? search_gender.value : search_genders[0],
      weight: search_weight && search_weight.id && search_weight.weight !== 'All' ? search_weight.id : '',
      dan: search_dan ? search_dan.value : ''
    };
    
    if (!user_is_club && !search_params.stype) {
      this.setState({
        search_required: false
      });
      return;
    }

    if ((search_params.stype == 'member' || user_is_club) && !search_params.mtype) {
      this.setState({
        member_required: false
      });
      return;
    }

    this.search(search_params);

    this.props.history.push(`/search${QueryString.stringify(search_params, { addQueryPrefix: true })}`);
  }

  async search(search_params) {
    const search_response = await Api.get('search', search_params);
    const { response, body } = search_response;

    switch (response.status) {
      case 200:
        this.setState({
          search_data: body,
          members: body
        });
        break;
      default:
        break;
    }
  }

  handleEdit(id, index) {
    const { isOpenEditModal, search_type } = this.state;
    this.setState({
      isOpenEditModal: !isOpenEditModal,
      search_type: search_type == '' ? search_type_options.filter(type => type.value == 'member')[0] : search_type,
      edit_item: id,
      editIndex: index
    });
  }

  handleDelete(id) {
    const { search_data, search_type } = this.state;
    let delItem = '';
    for (let i = 0; i < search_data.length; i++) {
      const item = search_data[i];
      if (item.id == id) {
        delItem = item;
      }
    }

    this.setState({
      isOpenDeleteModal: true,
      deleteId: id,
      confirmationMessage: `Are you sure you want to delete "${search_type.value == 'member'
        ? `${delItem.name} ${delItem.surname}` : delItem.name_o}"?`
    });
  }

  async handleDeleteMember(id) {
    const { search_type, search_data } = this.state;
    if (search_type.value !== 'member') {
      const delOrg = await Api.delete(`organization/${id}`);
      switch (delOrg.response.status) {
        case 200:
          this.setState({
            alertVisible: true,
            messageStatus: true,
            isOpenDeleteModal: false,
            successMessage: delOrg.body.message,
            search_data: search_data.filter(item => item.id !== id)
          });
          break;
        case 406:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenDeleteModal: false,
            failMessage: delOrg.body.message
          });
          break;
        default:
          break;
      }
    } else {
      const delMem = await Api.delete(`member/${id}`);
      switch (delMem.response.status) {
        case 200:
          this.setState({
            alertVisible: true,
            messageStatus: true,
            isOpenDeleteModal: false,
            successMessage: delMem.body.message,
            search_data: search_data.filter(item => item.id !== id)
          });
          break;
        case 406:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenDeleteModal: false,
            failMessage: delMem.body.message
          });
          break;
        default:
          break;
      }
    }
    setTimeout(() => {
      this.setState({ alertVisible: false });
    }, 2000);
  }

  async handleSaveItem(id, item) {
    const {
      search_type, editIndex, search_data
    } = this.state;
    if (search_type.value !== 'member') {
      const updateOrg = await Api.put(`organization/${id}`, item);

      switch (updateOrg.response.status) {
        case 200:
          search_data[editIndex] = item;

          this.setState({
            isOpenEditModal: false,
            messageStatus: true,
            alertVisible: true,
            successMessage: `${item.name_o} is been update successfully!`,
            search_data: search_data.filter(data => data.is_club == item.is_club)
          });
          break;
        case 406:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: true,
            failMessage: updateOrg.body.message
          });
          break;
        case 422:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: updateOrg.body.data && (`${updateOrg.body.data.email !== undefined ? updateOrg.body.data.email : ''} ${updateOrg.body.data.register_no !== undefined ? updateOrg.body.data.register_no : ''}`)
          });
          break;
        case 500:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: 'Internal Server Error!'
          });
          break;
        default:
          break;
      }
    } else {
      const updateMem = await Api.put(`member/${id}`, item);
      switch (updateMem.response.status) {
        case 200:
          this.setState({
            isOpenEditModal: false,
            messageStatus: true,
            alertVisible: true,
            successMessage: `${item.name} ${item.surname} is been update successfully!`
          });

          search_data[editIndex] = item;

          this.setState({
            search_data
          });

          break;
        case 406:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: updateMem.body.message
          });
          break;
        case 422:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: updateMem.body.data && 
            (`${updateMem.body.data.email !== undefined ? updateMem.body.data.email : ''} 
              ${updateMem.body.data.identity !== undefined ? updateMem.body.data.identity : ''}`)
          });
          break;
        case 500:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: 'Internal Server Error!'
          });
          break;
        default:
          break;
      }
    }
    setTimeout(() => {
      this.setState({ alertVisible: false });
    }, 3000);
  }

  handleConfirmationClose() {
    this.setState({
      isOpenDeleteModal: false,
      confirmationMessage: ''
    });
  }

  handleSelectItem(id) {
    const { search_type, init } = this.state;

    if (search_type.value == 'member' || init) {
      this.props.history.push('/member/detail', id);
    } else {
      this.props.history.push('/organization/detail', id);
    }
  }

  getWeights(gender) {
    return this.state.weights.filter((weight) => {
      if (`${gender}` == '0') {
        return true;
      }
      return `${weight.gender}` == `${gender}`;
    });
  }

  render() {
    const {
      level,
      user_is_club,
      org_list,
      orgs,
      roles,
      search_type,
      member_type,
      referee_type,
      weights,
      club_list,
      clubs,
      search_org,
      search_club,
      search_gender,
      search_weight,
      search_dan,
      search_required,
      member_required,
      search_data,
      init,
      filter,
      errors,
      isOpenDeleteModal,
      confirmationMessage,
      isOpenEditModal,
      edit_item
    } = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content dashboard">
          <Container fluid>
            <h3 className="text-danger text-center mb-5">
              Welcome to&nbsp;
              {
                user_is_club ? (
                  "Club"
                ) : (
                  level == 1 ? "National Federation" : "Regional Federation"
                )
              }
              &nbsp;Management System!
            </h3>
            <Row>
              {
                !user_is_club && (
                  <Col xl="2" lg="4" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        name="search_type"
                        classNamePrefix={!search_required ? 'invalid react-select-lg' : 'react-select-lg'}
                        placeholder="Search Type"
                        indicatorSeparator={null}
                        value={search_type}
                        options={
                          level != 1 ? (
                            search_type_options.filter(item => item.value != 'org')
                          ) : (
                            search_type_options
                          )
                        }
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
                )
              }
              {
                level == 1 && search_type.value == 'org' && (
                  <Col xl="2" lg="4" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        name="search_org"
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
                level == 1 && (search_type.value == 'club' || search_type.value == 'member') && (
                <Col xl="2" lg="4" md="4" sm="6" xs="12">
                  <FormGroup>
                    <Select
                      name="search_org"
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
                (search_type.value == 'club' || search_type.value == 'member') &&
                !user_is_club && (
                  <Col xl="2" lg="4" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        name="search_club"
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
                (search_type.value == 'member' || user_is_club) && (
                  <Col xl="2" lg="4" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        name="member_type"
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
                (search_type.value == 'member' || user_is_club) && (
                  <Col xl="2" lg="4" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Input
                        name="search_name"
                        placeholder="Name"
                        value={filter}
                        onChange={(event) => {
                          this.handleSearchFilter('search_name', event.target.value);
                        }}
                      />
                    </FormGroup>
                  </Col>
                )
              }
              {
                (search_type.value == 'member' || user_is_club) && member_type.value == 'referee' && (
                  <Col xl="2" lg="4" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        name="referee_type"
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
                (search_type.value == 'member' || user_is_club) && member_type.value == 'judoka' && (
                  <Fragment>
                    <Col xl="2" lg="4" md="4" sm="6" xs="12">
                      <FormGroup>
                        <Select
                          name="search_gender"
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
                    <Col xl="2" lg="4" md="4" sm="6" xs="12">
                      <FormGroup>
                        <Select
                          name="search_weight"
                          classNamePrefix="react-select-lg"
                          placeholder="Weight"
                          // isMulti
                          value={search_weight}
                          options={this.getWeights(search_gender ? search_gender.value : '')}
                          getOptionValue={option => option.id}
                          getOptionLabel={option => `${option.weight} Kg`}
                          onChange={(weight) => {
                            this.handleSearchFilter('search_weight', weight);
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col xl="2" lg="4" md="4" sm="6" xs="12">
                      <FormGroup>
                        <Select
                          name="search_dan"
                          classNamePrefix="react-select-lg"
                          placeholder="Dan"
                          // isMulti
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
              <Col sm="12">
                <div className="text-center">
                  <FormGroup>
                    <Button
                      type="button"
                      color="success"
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
          <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
            {
              this.state.messageStatus ? this.state.successMessage : this.state.failMessage
            }
          </Alert>
          {
            search_data && search_data.length == 0 && (
              <div className="fixed-content">
                <h3 className="text-muted">
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
                    init={init}
                    stype={search_type}
                    mtype={member_type}
                    items={search_data}
                    display={true}
                    onEdit={this.handleEdit.bind(this)}
                    onDelete={this.handleDelete.bind(this)}
                    onSelect={this.handleSelectItem.bind(this)}
                  />
                </div>
              </Container>
            )
          }
          { isOpenDeleteModal && <Prompt title={confirmationMessage} id={this.state.deleteId} handleAccept={this.handleDeleteMember} handleCancel={this.handleConfirmationClose} /> }
          {
            isOpenEditModal && (
            <EditModal
              id={edit_item}
              type={search_type}
              weights={weights}
              orgs={org_list}
              clubs={club_list}
              roles={roles}
              errors={errors}
              handleSave={this.handleSaveItem}
              handleCancel={this.handleEdit.bind(this)}
            />
            )
          }
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Search);