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
  Container, Row, Col, FormGroup, Button
} from 'reactstrap';
import { Segment, Input } from 'semantic-ui-react';
import Select from 'react-select';

import Api from '../../apis/app';

import MainTopBar from '../../components/TopBar/MainTopBar';
import CompetitionMemberTable from '../../components/CompetitionMemberTable';
import CompetitionJudokaTable from '../../components/CompetitionJudokaTable';
import CompetitionSelectTable from '../../components/CompetitionSelectTable';
import { member_type_options, search_genders } from '../../configs/data';

class CompetitionInscribe extends Component {
  constructor(props) {
    super(props);

    const user = JSON.parse(localStorage.getItem('auth'));

    this.state={
      expire: '',
      org_id: user.user.member_info.organization_id,
      name: '',
      from: '',
      to: '',
      place: '',
      weights: [],
      filter_member: [],
      filter_judoka: [],
      members: [],
      judokas: [],
      selectMembers: [],
      filter: {
        search_type: '',
        search_name: '',
        search_gender: search_genders[0],
        search_weight: ''
      },
      status: null
    }

    if (member_type_options.length === 4) {
      member_type_options.splice(0, 0, { label: 'All Members', value: '' });
    }

    this.end = '';
  }

  timer() {
    let distance = this.end - new Date().getTime();
    let expire = '';

    if (distance > 0) {
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      expire = 'Expire time left : ' + days + "d " + hours + "h " + minutes + "m " + seconds + "s";
    } else {
      expire = 'Expired.'
    }

    this.setState({
      expire
    });
  }

  componentDidMount() {
    this.init();
  }

  async init() {
    const competition_id = this.props.location.state;

    const competition = await Api.get(`competition/${competition_id}`);
    switch (competition.response.status) {
      case 200:
        let comp = competition.body.competition;

        let now = new Date().getTime();
        let start = new Date(comp.register_from).getTime();
        this.end = new Date(comp.register_to).getTime() + 86400000;

        if (now > start && now < this.end) {
          let intervalId = setInterval(this.timer.bind(this), 1000);

          this.setState({
            intervalId
          });
        }

        this.setState({
          name: comp.name,
          from: comp.from,
          to: comp.to,
          place: comp.place
        });
        break;
      default:
        break;
    }

    const params = {};

    params.competition_id = competition_id;
    params.club_id = this.state.org_id;

    const members = await Api.post('allow-members', params);
    switch (members.response.status) {
      case 200:
        this.setState({
          filter_member: members.body.data.filter(
            member => member.role_id != 4
          ),
          members: members.body.data.filter(
            member => member.role_id != 4
          ),
          filter_judoka: members.body.data.filter(member => member.role_id == 4),
          judokas: members.body.data.filter(member => member.role_id == 4)
        });
        break;
      default:
        break;
    }

    const selects = await Api.post('competition-members', params);
    switch (selects.response.status) {
      case 200:
        this.setState({
          selectMembers: selects.body.data
        });
        break;
      default:
        break;
    }

    const check = await Api.post('check-competition', params);
    switch (check.response.status) {
      case 200:
        this.setState({
          status: check.body.data
        });
        break;
      default:
        break;
    }

    const weight_list = await Api.post('competion-weights', params);
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

  getWeights(gender) {
    return this.state.weights.filter((weight) => {
      if (`${gender}` == '0') {
        return true;
      }
      return `${weight.gender}` == `${gender}`;
    });
  }

  handleSearchFilter(type, value) {
    const {filter, filter_member, filter_judoka} = this.state;
    filter[type] = value;

    if (type == 'search_gender') {
      filter['search_weight'] = '';
    }
    
    this.setState({
      filter
    });

    if (type == 'search_type') {
      let filtered = filter_member;
  
      if (filter.search_type != '' && filter.search_type.value != '') {
        filtered = filtered.filter(member => member.role_name == filter.search_type.label);
      }
  
      this.setState({
        members: filtered
      });
    } else {
      let filtered = filter_judoka;

      if (filter.search_name != '') {
        filtered = filtered.filter(
          member => member.name.toUpperCase().includes(filter.search_name.toUpperCase()) || 
                    member.surname.toUpperCase().includes(filter.search_name.toUpperCase()))
      }
  
      if (filter.search_gender.value != '') {
        filtered = filtered.filter(member => member.gender == filter.search_gender.value)
      }
      
      if (filter.search_weight != '' && filter.search_weight.weight != 'All') {
        filtered = filtered.filter(member => member.weight == filter.search_weight.weight);
      }
      
      this.setState({
        judokas: filtered
      });
    }
  }

  handleSelectMember(member, checked) {
    const { selectMembers, members, judokas } = this.state;

    for (let i = 0; i < members.length; i++) {
      const item = members[i];
      if (item.id === member) {
        item.checked = checked;
      }
    }

    for (let i = 0; i < judokas.length; i++) {
      const item = judokas[i];
      if (item.id === member) {
        item.checked = checked;
      }
    }
    
    if (checked) {
      let selects = [...selectMembers];

      let mem = members.filter(item => item.checked === true);
      let judo = judokas.filter(item => item.checked === true);

      for (var i = 0; i < mem.length; i++) {
        var flag = true;

        for (var k = 0; k < selectMembers.length; k++) {
          if (mem[i].id == selectMembers[k].id) {
            flag = false;
          }
        }

        if (flag) {
          selects.push(mem[i]);
        }
      }

      for (var j = 0; j < judo.length; j++) {
        var flag = true;

        for (var k = 0; k < selectMembers.length; k++) {
          if (judo[j].id == selectMembers[k].id) {
            flag = false;
          }
        }

        if (flag) {
          selects.push(judo[j]);
        }
      }
      
      selects.sort(function(a, b) {
        return a['role_id'] - b['role_id'] || a['weight_id'] - b['weight_id'];
      });
      
      this.setState({
        selectMembers: selects
      });
    } else {
      this.setState({
        selectMembers: selectMembers.filter(item => item.id !== member)
      });
    }
  }

  handleSelectAllMember(data, event) {
    const { members, selectMembers } = this.state;
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      for (let j = 0; j < data.length; j++) {
        const item = data[j];
        if (item.id === member.id) {
          member.checked = event.target.checked;
        }
      }
    }
    
    let mem = [];
    if (event.target.checked) {
      data.map(item => {
        if (!selectMembers.includes(item)) {
          mem.push(item);
        }
      });

      mem = selectMembers.concat(mem).sort(function(a, b) {
        return a['role_id'] - b['role_id'] || a['weight_id'] - b['weight_id'];
      });

      this.setState({
        selectMembers: mem
      });
    } else {
      selectMembers.map(item => {
        if (!members.includes(item)) {
          mem.push(item);
        }
      });

      this.setState({
        selectMembers: mem
      });
    }
  }

  handleSelectAllJudoka(data, event) {
    const { judokas, selectMembers } = this.state;
    for (let i = 0; i < judokas.length; i++) {
      const judoka = judokas[i];
      for (let j = 0; j < data.length; j++) {
        const item = data[j];
        if (item.id === judoka.id) {
          judoka.checked = event.target.checked;
        }
      }
    }
    
    let mem = [];

    if (event.target.checked) {
      data.map(item => {
        if (!selectMembers.includes(item)) {
          mem.push(item);
        }
      });

      mem = selectMembers.concat(mem).sort(function(a, b) {
        return a['role_id'] - b['role_id'] || a['weight_id'] - b['weight_id'];
      });

      this.setState({
        selectMembers: mem
      });
    } else {
      selectMembers.map(item => {
        if (!judokas.includes(item)) {
          mem.push(item);
        }
      });

      this.setState({
        selectMembers: mem
      });
    }
  }

  async handleAttend() {
    const { selectMembers } = this.state;
    
    if (selectMembers && selectMembers.length > 0) {
      const params = {};

      params.competition_id = this.props.location.state;
      params.club_id = this.state.org_id;
      params.members = selectMembers.map(item => item.id);

      const data = await Api.post('attend-competition', params);
      switch (data.response.status) {
        case 200:
          this.setState({
            status: 2
          });

          this.init();
          break;
        default:
          break;
      }
    } else {
      window.alert('You should select at least one member!');
    }
  }

  handleDeleteMember(id) {
    const { members, judokas, selectMembers } = this.state;
    let mem = [];

    let member = selectMembers.filter(item => item.id == id)[0];
    if (member['role_id'] == 4) {
      mem = judokas.concat(member).sort(function(a, b) {
        return a['weight_id'] - b['weight_id'] || a['name'] - b['name'];
      });

      this.setState({
        judokas: mem
      });
    } else {
      mem = members.concat(member).sort(function(a, b) {
        return a['role_id'] - b['role_id'] || a['name'] - b['name'];
      });

      this.setState({
        members: mem
      });
    }

    this.setState({
      selectMembers: selectMembers.filter(item => item.id !== id)
    });
  }

  render() {
    const { 
      expire,
      name, from, to, place,
      members, judokas, selectMembers,
      filter, status
    } = this.state;
    
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content dashboard">
          <Container>
            <Row>
              <Col sm="12">
                <Segment>
                  <Row>
                    <Col sm="12">
                      <h3 className="py-5 text-center text-danger">Welcome to competion "{name}"</h3>
                    </Col>
                    <Col sm="12">
                      <h3 className="py-2 text-center text-info">
                        Competition Place: {place}
                      </h3>
                    </Col>
                    <Col sm="12">
                      <h3 className="py-2 text-center text-success">
                        Competition Time: {from} ~ {to}
                      </h3>
                    </Col>
                  </Row>
                </Segment>
              </Col>
            </Row>
          </Container>
          <Container>
          {
            expire && (
              <h4 className="text-center text-danger">{expire}</h4>
            )
          }
          {
            selectMembers && selectMembers.length > 0 && status == 2 && (
              <div>
                <h2 className="text-center text-danger">
                  Congratulations!
                </h2>
                <h3 className="text-center text-success mt-3">
                  Your club's members are regisetered in competition successfully!
                </h3>
              </div>
            )
          }
          {
            selectMembers && selectMembers.length > 0 && status == 1 && (
            <Row className="mt-2">
              <Col sm="12" className="table-responsive">
                <CompetitionSelectTable
                  items={selectMembers}
                />
              </Col>
            </Row>
            )
          }
          </Container>
          {
            status != 1 && ((members && members.length > 0) || (judokas && judokas.length > 0))  && (
              <Container>
                <Row className="mb-2">
                  <Col sm="12" className="text-center">
                    <FormGroup>
                      <Button
                        type="button"
                        color="success"
                        onClick={this.handleAttend.bind(this)}
                      >
                        Submit Members
                      </Button>
                    </FormGroup>
                  </Col>
                </Row>
              </Container>
            )
          }
          <Container fluid className="mt-5">
            <Row>
              <Col md="6" sm="12">
                {
                  status != 1 && (
                    <Row className="mb-3">
                      <Col sm="4">
                        <FormGroup>
                          <Select
                            name="search_type"
                            classNamePrefix={'react-select-lg'}
                            placeholder="Member Type"
                            value={filter.search_type}
                            options={member_type_options.filter(option => option.value != 'judoka')}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            onChange={(type) => {
                              this.handleSearchFilter('search_type', type);
                            }}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="8"></Col>
                      <Col sm="12">
                        <CompetitionMemberTable
                          items={members}
                          onSelect={this.handleSelectMember.bind(this)}
                          onSelectAll={this.handleSelectAllMember.bind(this)}
                        />
                      </Col>
                    </Row>
                  )
                }
                {
                  status != 1 && (
                    <Row>
                      <Col sm="4">
                        <FormGroup>
                          <Input
                            name="search_name"
                            placeholder="Name"
                            value={filter.search_name}
                            onChange={(event) => {
                              this.handleSearchFilter('search_name', event.target.value);
                            }}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Select
                            name="search_gender"
                            classNamePrefix="react-select-lg"
                            placeholder="All Gender"
                            value={filter.search_gender}
                            options={search_genders}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            onChange={(gender) => {
                              this.handleSearchFilter('search_gender', gender);
                            }}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Select
                            name="search_weight"
                            classNamePrefix="react-select-lg"
                            placeholder="Weight"
                            value={filter.search_weight}
                            options={this.getWeights(filter.search_gender ? filter.search_gender.value : '')}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => `${option.weight} Kg`}
                            onChange={(weight) => {
                              this.handleSearchFilter('search_weight', weight);
                            }}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="12" className="table-responsive">
                        <CompetitionJudokaTable
                          items={judokas}
                          onSelect={this.handleSelectMember.bind(this)}
                          onSelectAll={this.handleSelectAllJudoka.bind(this)}
                        />
                      </Col>
                    </Row>
                  )
                }
              </Col>
              {
                status != 1 && selectMembers && selectMembers.length > 0 && (
                  <Col md="6" sm="12">
                    <Row>
                      <Col sm="12" className="table-responsive">
                        <CompetitionSelectTable
                          items={selectMembers}
                          delCol={true}
                          onDelete={this.handleDeleteMember.bind(this)}
                        />
                      </Col>
                    </Row>
                  </Col>
                )
              }
            </Row>
          </Container>
        </div>
      </Fragment>
    )
  }
}

export default withRouter(CompetitionInscribe);