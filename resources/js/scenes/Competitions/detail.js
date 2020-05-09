import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col,
  FormGroup, FormFeedback,
  Input, Label,
  Alert
} from 'reactstrap';
import { Segment } from 'semantic-ui-react';
import Select from 'react-select';
import SemanticDatepicker from 'react-semantic-ui-datepickers';

import { PDFExport } from '@progress/kendo-react-pdf';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';

import Api from '../../apis/app';

import MainTopBar from '../../components/TopBar/MainTopBar';
import CompetitionClubTable from '../../components/CompetitionClubTable';
import CompetitionSelectTable from '../../components/CompetitionSelectTable';
import Bitmaps from '../../theme/Bitmaps';

import { CompetitionType } from '../../configs/data';

class CompetitionDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expire: '',
      intervalId: '',
      end: '',
      competition_id: '',
      competition: [],
      comp_init: [],
      clubs: [],
      selectMembers: [],
      exportMembers: [],
      editable: false,
      edit: false,
      alertVisible: false,
      messageStatus: false,
      message: '',
      detail: false,
      exportPDF: false,
      pageSize: 5,
      data: [],
      skip: 0,
    };

    this.end = '';
  }

  timer() {
    let distance = this.end - new Date().getTime();

    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.setState({
      expire: days + "d " + hours + "h " + minutes + "m " + seconds + "s "
    });
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const club_member = user.user.is_club_member;
    const user_org = user.user.member_info.organization_id;

    const competition_id = this.props.location.state;

    this.setState({
      is_nf: user.user.is_nf,
      competition_id
    });

    const data = await Api.get(`competition/${competition_id}`);
    switch (data.response.status) {
      case 200:
        let competition = data.body.competition;

        this.setState({
          editable: (competition.creator_id == user_org)
        });

        this.convertCompetition(competition);

        break;
      default:
        break;
    }

    const params = {};

    params.competition_id = this.props.location.state;

    if (club_member == 1) {
      params.club_id = user_org;
    } else {
      params.club_id = '';
    }

    const clubs = await Api.post('competition-clubs', params);
      switch (clubs.response.status) {
        case 200:
          this.setState({
            clubs: clubs.body.result
          });
          break;
        default:
          break;
      }
  }

  async convertCompetition(competition) {
    let now = new Date().getTime();
    let start = new Date(competition.register_from).getTime();
    this.end = new Date(competition.register_to).getTime() + 86400000;

    if (now > start && now < this.end) {
      let intervalId = setInterval(this.timer.bind(this), 1000);

      this.setState({
        intervalId
      });
    }

    let comp_init = {...competition};

    this.setState({
      competition,
      comp_init
    });
  }

  async handleSelectClub(club_id, action) {
    const params = {};
    let members = [];

    params.competition_id = this.props.location.state;
    params.club_id = club_id;
    
    const selects = await Api.post('competition-members', params);
    switch (selects.response.status) {
      case 200:
        members = selects.body.data
        break;
      default:
        break;
    }

    if (action == 'detail') {
      this.setState({
        selectMembers: members,
        detail: true,
        exportPDF: false
      });
    }

    if (action == 'export') {
      let exportMembers = [];
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let role = '';
      let gender = '';
      let flag = true;
      var j = 0;

      for (var i = 0; i < members.length; i++) {
        let arr = [];

        role = members[i].role_name;

        if (role != 'Judoka' && role != '-' && flag) {
          j = 1;

          arr = {
            "": '',
            "Name": '',
            "M / F": '',
            "Date of Birth": '',
            "Category": 'DELEGATION',
            "#": ''
          }
  
          exportMembers.push(arr);

          flag = false;
        }

        if (role == 'Judoka' || role == '-') {
          role = '-';
          
          if (gender != members[i].gender) {
            j = 1;
            let gender_txt = members[i].gender == 1 ? 'Male' : 'Female';

            arr = {
              "": '',
              "Name": '',
              "M / F": '',
              "Date of Birth": '',
              "Category": 'Seniors ' + gender_txt,
              "#": ''
            }
    
            exportMembers.push(arr);
          }

          gender = members[i].gender;
        }

        let datePart = members[i].birthday.match(/\d+/g);

        arr = {
          "": i + 1,
          "Name": members[i].surname + ' ' + members[i].name,
          "M / F": members[i].gender == 1 ? 'M' : 'F',
          "Date of Birth": datePart[2] + '-' + months[parseInt(datePart[1]) - 1] + '-' + datePart[0],
          "Category": members[i].weight == null ? members[i].role_name : members[i].weight + ' Kg',
          "#": j++
        }

        exportMembers.push(arr);
      }
      
      this.setState({
        exportMembers,
        detail: false,
        exportPDF: true,
        data: exportMembers.slice(0, this.state.pageSize)
      });
    }
  }

  pageChange(event) {
    let skip = event.page.skip;
    let take = event.page.take;

    this.setState({
      data: this.state.exportMembers.slice(skip, skip + take),
      skip
    });
  }

  handleexportPDF() {
    this.gridPDFExport.save();
  }

  handleEdit() {
    this.setState({
      edit: true
    });
  }

  handleChange(type, data) {
    let { competition } = this.state;

    switch (type) {
      case 'name':
      case 'short_name':
      case 'place':
        competition[type] = data.target.value;
        break;
      case 'type':
      case 'legal_birth_from':
      case 'legal_birth_to':
        competition[type] = data.value;
        break;
      default:
        break;
    }

    this.setState({
      competition
    });
  }

  onChangeFrom(event, data) {
    let { competition } = this.state;

    competition.from = data.value;
    
    this.setState({
      competition
    });
  }

  onChangeTo(event, data) {
    let { competition } = this.state;

    competition.to = data.value;

    this.setState({
      competition
    });
  }

  onChangeRegisterFrom(event, data) {
    let { competition } = this.state;

    competition.register_from = data.value;

    this.setState({
      competition
    });
  }

  onChangeRegisterTo(event, data) {
    let { competition } = this.state;

    competition.register_to = data.value;

    this.setState({
      competition
    });
  }

  convertDate(d) {
    let year = d.getFullYear();

    let month = d.getMonth() + 1;
    if (month < 10)
      month = '0' + month;

    let day = d.getDate();
    if (day < 10)
      day = '0' + day;

    return (year + '-' + month + '-' + day);
  }

  async handleSave() {
    let { competition } = this.state;
    
    if (!competition.from || !competition.to) {
      return;
    }

    if (!competition.register_from || !competition.register_to) {
      return;
    }

    let newData = {
      id: competition.id,
      creator_id: competition.creator_id,
      name: competition.name,
      short_name: competition.short_name,
      place: competition.place,
      type: competition.type,
      from: this.convertDate(new Date(competition.from)),
      to: this.convertDate(new Date(competition.to)),
      register_from: this.convertDate(new Date(competition.register_from)),
      register_to: this.convertDate(new Date(competition.register_to)),
      legal_birth_from: competition.legal_birth_from,
      legal_birth_to: competition.legal_birth_to,
      gender: competition.gender,
      weights: competition.weights,
      reg_ids: competition.reg_ids,
      club_ids: competition.club_ids
    }
    
    const data = await Api.put(`competition/${competition.id}`, newData);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          alertVisible: true,
          messageStatus: true,
          message: 'Updated Successfully!'
        });

        competition.from = this.convertDate(new Date(competition.from));
        competition.to = this.convertDate(new Date(competition.to));
        competition.register_from = this.convertDate(new Date(competition.register_from));
        competition.register_to = this.convertDate(new Date(competition.register_to));

        this.setState({
          competition
        });

        this.convertCompetition(newData);

        setTimeout(() => {
          this.setState({ 
            alertVisible: false,
            edit: false
          });
        }, 2000);
        break;
      case 406:
        if (body.message) {
          this.setState({
            alertVisible: true,
            messageStatus: false,
            message: body.message
          });
        }

        this.convertCompetition(newData);
        break;
      default:
        break;
    }
  }

  handleCancel() {
    const { comp_init } = this.state;

    let newData = {
      id: comp_init.id,
      creator_id: comp_init.creator_id,
      name: comp_init.name,
      short_name: comp_init.short_name,
      place: comp_init.place,
      type: comp_init.type,
      from: this.convertDate(new Date(comp_init.from)),
      to: this.convertDate(new Date(comp_init.to)),
      register_from: this.convertDate(new Date(comp_init.register_from)),
      register_to: this.convertDate(new Date(comp_init.register_to)),
      legal_birth_from: comp_init.legal_birth_from,
      legal_birth_to: comp_init.legal_birth_to,
      gender: comp_init.gender,
      weights: comp_init.weights,
      reg_ids: comp_init.reg_ids,
      club_ids: comp_init.club_ids
    }

    this.setState({
      alertVisible: false,
      edit: false
    });

    this.convertCompetition(newData);
  }

  render() {
    const {
      editable, edit,
      is_nf,
      expire,
      competition, clubs,
      selectMembers, detail,
      exportMembers, exportPDF,
    } = this.state;

    let d = new Date();
    let year = d.getFullYear();

    let years = [];
    for (let i = year - 10; i > 1950 ; i--) {
      years.push({label: i, value: i});
    }

    return (
      <Fragment>
        <MainTopBar />

        <div className="main-content">
          <Container>
            <Segment>
              <div className="w-100 mb-5">
                <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
                  {this.state.message}
                </Alert>
              </div>
              {
                !edit &&  (
                  <Row>
                    <Col sm="12">
                      <h3 className="text-center text-primary">{competition.name}</h3>
                    </Col>
                    <Col sm="12" className="mt-5">
                      <h4>
                        Competition Type: 
                        {
                          ' ' +
                          (competition.type && 
                            CompetitionType.filter(type => type.value == competition.type)[0]['label'])
                        }
                      </h4>
                    </Col>
                    <Col sm="12" className="mt-3">
                      <h4>Competition Place: {competition.place}</h4>
                    </Col>
                    <Col sm="12" className="mt-3">
                      <h4>Competition Time: {competition.from} ~ {competition.to}</h4>
                    </Col>
                    <Col sm="12" className="mt-3">
                      <h4>Registration Period: {competition.register_from} ~ {competition.register_to}</h4>
                    </Col>
                    <Col sm="12" className="mt-3">
                      <h4>
                        Federations and Clubs: {competition.reg_ids} Regions, {competition.club_ids} Clubs
                        {
                          expire && (
                            <b className="text-danger"> ( {expire} )</b>
                          )
                        }
                      </h4>
                    </Col>
                    {
                      editable && (
                        <Col sm="12" className="mt-3">
                          <div className="text-right">
                            <button
                              className="btn btn-success"
                              onClick={this.handleEdit.bind(this)}
                            >
                              <i className="fa fa-pencil mr-2"></i>
                              Edit
                            </button>
                          </div>
                        </Col>
                      )
                    }
                  </Row>
                )
              }
              {
                edit && (
                  <Row>
                    {
                      is_nf == 1 && (
                        <Fragment>
                          <Col xs="12" sm="6">
                            <FormGroup>
                              <Label>Competition Type</Label>
                              <Select
                                classNamePrefix={'react-select-lg'}
                                indicatorSeparator={null}
                                options={CompetitionType.filter(type => type.value == 'inter' || type.value == 'nf')}
                                getOptionValue={option => option.value}
                                getOptionLabel={option => option.label}
                                value={CompetitionType.filter(type => type.value == competition.type)[0]}
                                onChange={this.handleChange.bind(this, 'type')}
                              />
                            </FormGroup>
                          </Col>
                          <Col xs="12" sm="6"></Col>
                        </Fragment>
                      )
                    }
                    <Col xs="12" sm="6">
                      <FormGroup>
                        <Label>Competition Name</Label>
                        <Input
                          type="text"
                          className={competition.name == '' ? 'is-invalid' : ''}
                          value={competition.name}
                          onChange={this.handleChange.bind(this, 'name')}
                        />
                      </FormGroup>
                      {competition.name == '' && (
                        <FormFeedback className="d-block">This field is required!</FormFeedback>
                      )}
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup>
                        <Label>Competition Short Name</Label>
                        <Input
                          type="text"
                          className={competition.short_name == '' ? 'is-invalid' : ''}
                          value={competition.short_name}
                          onChange={this.handleChange.bind(this, 'short_name')}
                        />
                      </FormGroup>
                      {competition.short_name == '' && (
                        <FormFeedback className="d-block">This field is required!</FormFeedback>
                      )}
                    </Col>
                    <Col xs="12" sm="12">
                      <FormGroup>
                        <Label>Competition Place</Label>
                        <Input
                          type="text"
                          className={competition.place == '' ? 'is-invalid' : ''}
                          value={competition.place}
                          onChange={this.handleChange.bind(this, 'place')}
                        />
                      </FormGroup>
                      {competition.place == '' && (
                        <FormFeedback className="d-block">This field is required!</FormFeedback>
                      )}
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!competition.from ? 'invalid calendar' : 'calendar'}>
                        <Label>From</Label>
                        <SemanticDatepicker
                          placeholder="From"
                          value={competition.from && competition.from !== undefined ? new Date(competition.from) : ''}
                          onChange={this.onChangeFrom.bind(this)}
                        />
                        {!competition.from && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!competition.to ? 'invalid calendar' : 'calendar'}>
                        <Label>To</Label>
                        <SemanticDatepicker
                          placeholder="To"
                          value={competition.to && competition.to !== undefined ? new Date(competition.to) : ''}
                          onChange={this.onChangeTo.bind(this)}
                        />
                        {!competition.to && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!competition.register_from ? 'invalid calendar' : 'calendar'}>
                        <Label>Registration From</Label>
                        <SemanticDatepicker
                          placeholder="Registration From"
                          value={
                            competition.register_from && competition.register_from !== undefined 
                              ? new Date(competition.register_from) 
                              : ''
                          }
                          onChange={this.onChangeRegisterFrom.bind(this)}
                        />
                        {!competition.register_from && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!competition.register_to ? 'invalid calendar' : 'calendar'}>
                        <Label>Registration To</Label>
                        <SemanticDatepicker
                          placeholder="Registration To"
                          value={
                            competition.register_to && competition.register_to !== undefined 
                              ? new Date(competition.register_to) 
                              : ''
                          }
                          onChange={this.onChangeRegisterTo.bind(this)}
                        />
                        {!competition.register_to && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label>Legal Date of Birth (Min)</Label>
                        <Select
                          classNamePrefix={'react-select-lg'}
                          indicatorSeparator={null}
                          options={years}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          value={years.filter(year => year.value == competition.legal_birth_from)[0]}
                          onChange={this.handleChange.bind(this, 'legal_birth_from')}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label>Legal Date of Birth (Max)</Label>
                        <Select
                          classNamePrefix={'react-select-lg'}
                          indicatorSeparator={null}
                          options={years}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          value={years.filter(year => year.value == competition.legal_birth_to)[0]}
                          onChange={this.handleChange.bind(this, 'legal_birth_from')}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <div className="text-right">
                        <button
                          className="btn btn-primary mr-2"
                          onClick={this.handleSave.bind(this)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={this.handleCancel.bind(this)}
                        >
                          Cancel
                        </button>
                      </div>
                    </Col>
                  </Row>
                )
              }

            </Segment>
            {
              clubs && clubs.length > 0 && (
                <Row>
                  <CompetitionClubTable
                    items={clubs}
                    detail
                    onSelect={this.handleSelectClub.bind(this)}
                  />
                </Row>
              )
            }
            {
              detail && selectMembers && selectMembers.length > 0 && (
                <Row className="mt-3">
                  <CompetitionSelectTable
                    items={selectMembers}
                  />
                </Row>
              )
            }
            {
              exportPDF && (
                <Row className="mt-3 pdf-export">
                  <button
                    title="Export PDF"
                    className="k-button k-primary"
                    onClick={this.handleexportPDF.bind(this)}
                  >
                    Export PDF
                  </button>
                  <PDFExport
                    paperSize="A4"
                    landscape={false}
                    fileName={"Members for " + competition.name}
                    margin={{ top: 60, left: 30, right: 30, bottom: 30 }}
                    ref={pdfExport => this.gridPDFExport = pdfExport}
                  >
                    <div className="mt-2 px-2 py-2">
                      <Row>
                        <Col sm="3" className="d-flex align-items-center justify-content-center">
                          <img src={Bitmaps.logo} alt="Sports logo" width='100%' />
                        </Col>
                        <Col sm="9">
                          <h4 className="text-center text-danger"><b>{competition.name}</b></h4>
                          <h5 className="text-center text-danger">{competition.from} ~ {competition.to}</h5>
                        </Col>
                      </Row>

                      <hr />

                      <Row className="mb-2">
                        <Col sm="12"><h5 className="text-center">MEMBER INFORMATION</h5></Col>
                      </Row>
                      
                      <Grid
                        total={exportMembers.length}
                        pageSize={exportMembers.length}
                        data={exportMembers}
                        skip={0}
                      >
                        <Column
                          headerClassName="text-center"
                          className="text-center"
                          field="#"
                          width="30px"
                          cell={cellWithBackGround}
                        />
                        <Column 
                          headerClassName="text-center" 
                          className="text-center"
                          field="Category"
                          width="100px"
                          cell={cellWithBackGround}
                        />
                        <Column headerClassName="text-center" className="text-center" field="M / F" width="50px" />
                        <Column headerClassName="text-center" field="Name" width="210px" />
                        <Column headerClassName="text-center" className="text-center" field="Date of Birth" width="100px" />
                        <Column headerClassName="text-center" className="text-center" field="" width="40px" />
                      </Grid>
                    </div>
                  </PDFExport>
                </Row>
              )
            }
          </Container>
        </div>
      </Fragment>
    );
  }
}

class cellWithBackGround extends React.Component {
  render() {
    let backgroundColor = "";
    let color = "rgb(0, 0, 0)";
    let textAlign = "center"

    switch (this.props.dataItem.Category) {
      case 'DELEGATION':
        backgroundColor = "rgb(141, 248, 80)";
        color = "rgb(255, 255, 255)";
        break;
      case 'Seniors Male':
        backgroundColor = "rgb(196, 218, 255)";
        color = "rgb(255, 255, 255)";
        break;
      case 'Seniors Female':
        backgroundColor = "rgb(238, 198, 190)";
        color = "rgb(255, 255, 255)";
        break;
      default:
        break;
    }

    const style = { 
      backgroundColor,
      color,
      textAlign,
      border: '1px solild red'
    };

    return (
        <td style={style}>
            {this.props.dataItem[this.props.field]}
        </td>
    );
  }
}

export default CompetitionDetail;