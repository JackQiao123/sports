/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import { Segment } from 'semantic-ui-react';
import { 
  Row, Col
} from 'reactstrap';

import { PDFExport } from '@progress/kendo-react-pdf';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';

import Api from '../../apis/app';

import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import CompetitionClubTable from '../../components/CompetitionClubTable';
import CompetitionSelectTable from '../../components/CompetitionSelectTable';
import Bitmaps from '../../theme/Bitmaps';

import { CompetitionType, CompetitionLevel } from '../../configs/data';

class CompetitionDetail extends Component {
  constructor(props) {
    super(props);

    this.state={
      is_super: 1,
      competition: [],
      clubs: [],
      detail: false,
      selectMembers: [],
      exportPDF: false,
      exportMembers: [],
      pageSize: 5,
      data: [],
      skip: 0
    }
  }

  async componentDidMount() {
    const competition_id = this.props.location.state;
    
    const data = await Api.get(`competition/${competition_id}`);
    switch (data.response.status) {
      case 200:
        this.setState({
          competition: data.body.competition
        });
        break;
      default:
        break;
    }

    const clubs = await Api.get(`competition-clubs/${competition_id}`);
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
            "ID": '',
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
              "ID": '',
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
          "ID": members[i].identity.substring(0, 12),
          "#": j++
        }

        exportMembers.push(arr);
      }
      
      this.setState({
        exportMembers,
        edit: false,
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

  handleBack() {
    this.props.history.push('/admin/competitions');
  }

  render() {
    const {
      is_super,
      competition, clubs,
      detail, selectMembers,
      exportPDF, exportMembers
    } =this.state;

    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <div className="content">
              <div className="mt-3 w-100 d-flex justify-content-end">
                <a className="detail-link mr-4" onClick={this.handleBack.bind(this)}>
                  <i className="fa fa-angle-double-left"></i> Back
                </a>
              </div>
              <Segment>
                <Row>
                  <Col sm="12">
                    <h3 className="text-center">{competition.name}</h3>
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
                    <h4>
                      Competition Level:
                      {
                        ' ' +
                        (competition.level && 
                          CompetitionLevel.filter(level => level.value == competition.level)[0]['label'])
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
                    <h4>Federations and Clubs: {competition.reg_ids} Regions, {competition.club_ids} Clubs</h4>
                  </Col>
                </Row>
              </Segment>
              {
                clubs && clubs.length > 0 && (
                  <Row>
                    <Col sm="12">
                      <CompetitionClubTable
                        items={clubs}
                        onSelect={this.handleSelectClub.bind(this)}
                        is_super={is_super}
                      />
                    </Col>
                  </Row>
                )
              }
              {
                detail && selectMembers && selectMembers.length > 0 && (
                  <Row className="mt-3">
                    <Col sm="12">
                      <CompetitionSelectTable
                        items={selectMembers}
                      />
                    </Col>
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
                          <Col sm="4" className="d-flex align-items-center justify-content-center">
                            <img src={Bitmaps.logo} alt="Sports logo" width='80%' />
                          </Col>
                          <Col sm="8">
                            <h3 className="text-center text-danger"><b>{competition.name}</b></h3>
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
                            width="20px"
                            cell={cellWithBackGround}
                          />
                          <Column 
                            headerClassName="text-center" 
                            className="text-center"
                            field="Category"
                            width="90px"
                            cell={cellWithBackGround}
                          />
                          <Column headerClassName="text-center" className="text-center" field="M / F" width="40px" />
                          <Column headerClassName="text-center" field="Name" width="150px" />
                          <Column headerClassName="text-center" className="text-center" field="Date of Birth" width="90px" />
                          <Column headerClassName="text-center" field="ID" width="100px" />
                          <Column headerClassName="text-center" className="text-center" field="" width="40px" />
                        </Grid>
                      </div>
                    </PDFExport>
                  </Row>
                )
              }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

class cellWithBackGround extends Component {
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

export default withRouter(CompetitionDetail);