/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import { 
  Row, Col, Button, FormGroup
} from 'reactstrap';
import { Segment, Image, Input } from 'semantic-ui-react';
import Select from 'react-select';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import Bitmaps from '../../theme/Bitmaps';
import Api from '../../apis/app';
import {
  withRouter
} from 'react-router-dom';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import NFTransactionTable from '../../components/NFTransactionTable';

class NFProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nf: [],
      detail: [],
      filter: [],
      data: [],
      orgs: [],
      original_clubs: [],
      clubs: [],
      from: '',
      to: ''
    };
  }

  async componentDidMount() {
    const nf_id = this.props.location.state;
    
    const org = await Api.get(`organization/${nf_id}`);
    switch (org.response.status) {
      case 200:
        this.setState({
          nf: org.body
        });
        break;
      default:
        break;
    }

    const org_response = await Api.get(`organization-child/${nf_id}`);
    const { response, body } = org_response;
    switch (response.status) {
      case 200:
        this.setState({
          orgs: body.filter(item => item.is_club == 0)
        });
        break;
      default:
        break;
    }

    const club_list = await Api.get(`countryclubs/${nf_id}`);
    switch (club_list.response.status) {
      case 200:
        this.setState({
          original_clubs: club_list.body.clubs,
          clubs: club_list.body.clubs
        });
        break;
      default:
        break;
    }

    const trans = await Api.get(`transdetail/${nf_id}`);
    switch (trans.response.status) {
      case 200:
        for (let i = 0; i < trans.body.detail.length; i++) {
          trans.body.detail[i].created_at = trans.body.detail[i].created_at.substring(0, 10);
          trans.body.detail[i].len = trans.body.detail[i].players.split(',').length;

          let d = new Date(trans.body.detail[i].created_at);

          let year = d.getFullYear() + 1;

          let month = d.getMonth() + 1;
          if (month < 10)
            month = '0' + month;

          let day = d.getDate();

          trans.body.detail[i].expire = year + '-' + month + '-' + day;
        }
        
        this.setState({
          detail: trans.body.detail,
          filter: trans.body.detail,
          data: trans.body.detail
        });
        break;
      default:
        break;
    }
  }

  handleSearchFilter(type, value) {
    let from = this.state.from;
    let to = this.state.to;

    if (type == 'search_org') {
      if (!value) {
        if (from !== '' && to !== '') {
          this.setState({
            filter: this.state.detail.filter(item => Date.parse(item.created_at) >= from && 
                                              Date.parse(item.created_at) <= to),
            data: this.state.detail
          });
        } else {
          this.setState({
            filter: this.state.detail,
            data: this.state.detail
          });
        }
      } else {
        if (from !== '' && to !== '') {
          this.setState({
            clubs: this.state.original_clubs.filter(item => item.parent_id == value.id),
            filter: this.state.detail.filter(item => item.reg_id == value.id &&
                        Date.parse(item.created_at) >= from && Date.parse(item.created_at) <= to),
            data: this.state.detail.filter(item => item.reg_id == value.id)
          });
        } else {
          this.setState({
            clubs: this.state.original_clubs.filter(item => item.parent_id == value.id),
            filter: this.state.detail.filter(item => item.reg_id == value.id),
            data: this.state.detail.filter(item => item.reg_id == value.id)
          });
        }
      }
    }

    if (type == 'search_club') {
      if (!value) {
        if (from !== '' && to !== '') {
          this.setState({
            filter: this.state.detail.filter(item => Date.parse(item.created_at) >= from && 
                                              Date.parse(item.created_at) <= to),
            data: this.state.detail
          });
        } else {
          this.setState({
            filter: this.state.detail,
            data: this.state.detail
          });
        }
      } else {
        if (from !== '' && to !== '') {
          this.setState({
            filter: this.state.detail.filter(item => item.club_id == value.id &&
                        Date.parse(item.created_at) >= from && Date.parse(item.created_at) <= to),
            data: this.state.detail.filter(item => item.club_id == value.id)
          });
        } else {
          this.setState({
            filter: this.state.filter.filter(item => item.club_id == value.id),
            data: this.state.filter.filter(item => item.club_id == value.id)
          });
        }
      }
    }
  }

  onChangeFrom(event, data) {
    if (data.value) {
      let from = Date.parse(data.value);

      this.setState({
        from
      });

      if (this.state.to !== '') {
        this.setState({
          filter: this.state.data.filter(
            item => Date.parse(item.created_at) >= from && 
                    Date.parse(item.created_at) <= this.state.to)
        });
      }
    } else {
      this.setState({
        filter: this.state.data
      });
    }
  }

  onChangeTo(event, data) {
    if (data.value) {
      let to = Date.parse(data.value) + 86400000;

      this.setState({
        to
      });
      
      if (this.state.from !== '') {
        this.setState({
          filter: this.state.data.filter(
            item => Date.parse(item.created_at) >= this.state.from && 
                    Date.parse(item.created_at) <= to)
        });
      }
    } else {
      this.setState({
        filter: this.state.data
      });
    }
  }

  render() {
    const { nf, filter, orgs, clubs } = this.state;
    
    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <div className="text-right my-3">
              <Button 
                outline
                color="warning"
                onClick={() => this.props.history.push('/admin/home')}
              >
                <i className="fa fa-arrow-left fa-lg"></i>
              </Button>
            </div>

            <h3 className="text-center text-info mb-5"><b>{nf.name_o}</b></h3>

            <div className="content">
              <Row>
                <Col md="12" lg="8">
                  <Segment className="mt-2">
                    <Row>
                      <Col md="6" lg="3">
                        <div className="detail-image">
                          <Image className="m-auto" src={nf.logo ? nf.logo : Bitmaps.logo} />
                        </div>
                      </Col>
                      <Col md="6" lg="9">
                        <h5 className="py-2">
                          <b className="mr-2">Name :</b>
                          <span>{nf.name_o}{' '}({nf.name_s})</span>
                          <span>{nf.is_club ? (` (Regional Federation: ${nf.parent}) `) : ''}</span>
                        </h5>
                        <h5 className="py-2">
                          <b className="mr-2">Register No :</b>
                          <span>{nf.register_no}</span>
                        </h5>
                        <h5 className="py-2">
                          <b className="mr-2">Email :</b>
                          <a href={`mailto:${nf.email}`}>{nf.email}</a>
                        </h5>
                        <h5 className="py-2">
                          <b className="mr-2">Phone :</b>
                          <span>{nf.mobile_phone}</span>
                        </h5>
                        <h5 className="py-2">
                          <b className="mr-2">Address :</b>
                          <span>
                            {(nf.addressline1 && nf.addressline1 != '' && nf.addressline1 != '-') ? `${nf.addressline1}, ` : '' }
                            {(nf.addressline2 && nf.addressline2 != '' && nf.addressline2 != '-') ? `${nf.addressline2}, ` : '' }
                            {(nf.city && nf.city != '' && nf.city != '-') ? `${nf.city}, ` : '' }
                            {(nf.state && nf.state != '' && nf.state != '-') ? `${nf.state}, ` : '' }
                            {nf.zip_code}
                          </span>
                        </h5>
                      </Col>
                    </Row>
                  </Segment>
                </Col>
                <Col md="12" lg="4">
                  <Segment className="mt-2">
                    <h4 className="text-center"><b>Summary</b></h4>
                      <Row>
                        <Col sm="12">
                          <h5 className="py-2">
                            <span className="mr-2">President :</span>
                            <span>{nf.president}</span>
                          </h5>
                        </Col>
                        <Col sm="12">
                          <h5 className="py-2">
                            <span className="mr-2">Clubs :</span>
                            <span>{nf.clubs}</span>
                          </h5>
                        </Col>
                        <Col sm="12">
                          <h5 className="py-2">
                            <span className="mr-2">Judokas :</span>
                            <span className="mr-2">{nf.players}</span>
                            <span>( Male: {nf.mplayers}, Female: {nf.fplayers} )</span>
                          </h5>
                        </Col>
                      </Row>
                  </Segment>
                </Col>
              </Row>
              <Row className="mt-5">
                <Col xl="3" lg="3" md="6" sm="6" xs="12">
                  <FormGroup>
                    <Select
                      className="select-box"
                      classNamePrefix="react-select-lg"
                      placeholder="Regional Federation"
                      isClearable
                      options={orgs}
                      getOptionValue={option => option.id}
                      getOptionLabel={option => option.name_o}
                      onChange={(org) => {
                        this.handleSearchFilter('search_org', org);
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col xl="3" lg="3" md="6" sm="6" xs="12">
                  <FormGroup>
                    <Select
                      className="select-box"
                      classNamePrefix="react-select-lg"
                      placeholder="Club Name"
                      isClearable
                      options={clubs}
                      getOptionValue={option => option.id}
                      getOptionLabel={option => option.name_o}
                      onChange={(club) => {
                        this.handleSearchFilter('search_club', club);
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col xl="3" lg="3" md="6" sm="6" xs="12">
                  <FormGroup className="calendar">
                    <SemanticDatepicker
                      name="from"
                      placeholder="From"
                      onChange={this.onChangeFrom.bind(this)}
                    />
                  </FormGroup>
                </Col>
                <Col xl="3" lg="3" md="6" sm="6" xs="12">
                  <FormGroup className="calendar">
                    <SemanticDatepicker
                      name="to"
                      placeholder="To"
                      onChange={this.onChangeTo.bind(this)}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col sm="12">
                  <NFTransactionTable
                    items={filter}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(NFProfile);